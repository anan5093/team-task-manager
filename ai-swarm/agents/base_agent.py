import ollama
import json
import logging
import httpx
from typing import Optional, List, Dict, Any
from config import settings

logger = logging.getLogger(__name__)

async def query_llm(
    messages: List[Dict[str, Any]], 
    model: Optional[str] = None, 
    format: Optional[str] = None
) -> str:
    """
    Unified LLM query function.
    Routes to OpenRouter if settings.USE_OPENROUTER is True and settings.OPENROUTER_API_KEY is configured.
    Otherwise falls back to local Ollama.
    """
    if settings.USE_OPENROUTER and settings.OPENROUTER_API_KEY:
        logger.info(f"Routing completion to OpenRouter using model: {settings.OPENROUTER_MODEL}")
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            }
            
            # If model is local (e.g. "tinyllama" which lacks a slash), override with OpenRouter model
            target_model = model
            if not target_model or "/" not in target_model:
                target_model = settings.OPENROUTER_MODEL or "openrouter/auto"
            
            payload = {
                "model": target_model,
                "messages": messages
            }
            
            if format == 'json':
                payload["response_format"] = {"type": "json_object"}

            try:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60.0
                )
                
                # If OpenRouter returns 404 or 400, the model might be invalid
                if response.status_code in [404, 400]:
                    logger.warning(f"OpenRouter returned {response.status_code}. Trying with openrouter/auto...")
                    payload["model"] = "openrouter/auto"
                    response = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers=headers,
                        json=payload,
                        timeout=60.0
                    )
                    
                    if response.status_code == 400 and format == 'json':
                        logger.warning("Still getting 400. Retrying without response_format...")
                        if "response_format" in payload:
                            del payload["response_format"]
                        response = await client.post(
                            "https://openrouter.ai/api/v1/chat/completions",
                            headers=headers,
                            json=payload,
                            timeout=60.0
                        )

                if response.status_code != 200:
                    logger.error(f"OpenRouter error response (HTTP {response.status_code}): {response.text}")
                response.raise_for_status()
                res_data = response.json()
                
                if 'choices' not in res_data or not res_data['choices']:
                    raise ValueError(f"Invalid response format from OpenRouter: {res_data}")
                    
                message = res_data['choices'][0]['message']
                content = message.get('content') or ""
                
                # Log reasoning details if present
                if 'reasoning_details' in message:
                    logger.info(f"OpenRouter Reasoning Details: {message['reasoning_details']}")
                    
                return content
            except Exception as e:
                logger.error(f"OpenRouter request failed: {str(e)}")
                logger.info("Falling back to local Ollama due to OpenRouter error...")
                return await _query_ollama(messages, model, format)
    else:
        return await _query_ollama(messages, model, format)

async def _query_ollama(
    messages: List[Dict[str, Any]], 
    model: Optional[str] = None, 
    format: Optional[str] = None
) -> str:
    logger.info(f"Routing completion to local Ollama using model: {settings.MODEL}")
    client = ollama.AsyncClient(host=settings.OLLAMA_BASE_URL)
    response = await client.chat(
        model=model or settings.MODEL,
        messages=messages,
        format=format
    )
    return response['message']['content']

class BaseAgent:
    """
    Base class for all agents within the AI Swarm.
    Provides utility methods to interact with the LLM (via OpenRouter or Ollama).
    """
    def __init__(
        self, 
        name: str, 
        system_prompt: Optional[str] = None, 
        model: Optional[str] = None
    ):
        self.name = name
        self.system_prompt = system_prompt or f"You are the {name} agent, a specialized assistant in the AI Swarm."
        self.model = model

    async def execute(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Execute agent logic by sending the prompt to the LLM.
        """
        sys_prompt = system_prompt or self.system_prompt
        messages = [{"role": "system", "content": sys_prompt}]
        
        if history:
            messages.extend(history)
            
        messages.append({"role": "user", "content": prompt})
        
        logger.info(f"Agent [{self.name}] executing prompt...")
        try:
            return await query_llm(messages, model=self.model)
        except Exception as e:
            logger.error(f"Agent [{self.name}] execution failed: {str(e)}")
            raise RuntimeError(f"Agent {self.name} execution failed: {str(e)}") from e

    async def execute_json(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute agent logic and return the parsed JSON response.
        Enforces JSON output format from LLM.
        """
        sys_prompt = system_prompt or self.system_prompt
        sys_prompt += "\nOutput your response strictly as a JSON object."
        
        messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": prompt}
        ]
        
        logger.info(f"Agent [{self.name}] executing prompt for JSON response...")
        try:
            content = await query_llm(messages, model=self.model, format='json')
            return json.loads(content)
        except json.JSONDecodeError as jde:
            logger.error(f"Agent [{self.name}] failed to parse response content as JSON: {content}")
            raise RuntimeError(f"Agent {self.name} produced invalid JSON: {str(jde)}") from jde
        except Exception as e:
            logger.error(f"Agent [{self.name}] JSON execution failed: {str(e)}")
            raise RuntimeError(f"Agent {self.name} JSON query failed: {str(e)}") from e
