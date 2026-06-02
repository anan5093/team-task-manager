from typing import Any, Callable, Optional, Dict
import httpx
from config import settings

class BaseMCPServer:
    def __init__(self, name: str):
        self.name = name
        self.tools = {}
        self.http_client = None
    
    def register_tool(self, name: str, description: str, handler: Callable):
        self.tools[name] = {
            "description": description,
            "handler": handler
        }
    
    async def call_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name not in self.tools:
            raise ValueError(f"Tool {tool_name} not found")
        return await self.tools[tool_name]["handler"](**kwargs)
    
    def get_tools_schema(self) -> list:
        return [
            {
                "name": name,
                "description": info["description"],
                "type": "function"
            }
            for name, info in self.tools.items()
        ]
    
    async def _call_express_api(self, method: str, endpoint: str, **kwargs) -> dict:
        """Call Express backend API"""
        async with httpx.AsyncClient() as client:
            url = f"{settings.EXPRESS_API_URL}{endpoint}"
            headers = kwargs.pop('headers', {})
            
            if method == 'GET':
                response = await client.get(url, headers=headers, **kwargs)
            elif method == 'POST':
                response = await client.post(url, headers=headers, **kwargs)
            
            response.raise_for_status()
            return response.json()
