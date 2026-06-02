#!/usr/bin/env python3
"""
AI Swarm Service Launcher
==========================
Orchestrates the multi-agent system with FastAPI, LangGraph, and MCP servers.
Integrates with Express backend and Ollama for local LLM processing.
"""

import asyncio
import sys
import logging
import signal
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Add current directory to path to import packages
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    print(f"⚠️  Warning: No .env file found at {env_path}")
    print("   Using default configuration from config.py")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('ai_swarm.log')
    ]
)
logger = logging.getLogger(__name__)

# Import configuration
from config import settings
from orchestration.graph_builder import MultiAgentOrchestrator
from mcp_servers.task_retriever import task_retriever
from mcp_servers.project_auditor import project_auditor
from mcp_servers.report_synthesizer import report_synthesizer


class AISwarmService:
    """Main service orchestrator for AI Swarm system."""
    
    def __init__(self):
        self.orchestrator: Optional[MultiAgentOrchestrator] = None
        self.mcp_servers = {
            "task_retriever": task_retriever,
            "project_auditor": project_auditor,
            "report_synthesizer": report_synthesizer
        }
        self.running = False
        self._setup_signal_handlers()
    
    def _setup_signal_handlers(self):
        """Setup graceful shutdown handlers."""
        def signal_handler(signum, frame):
            logger.info(f"Received signal {signum}, initiating graceful shutdown...")
            self.running = False
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    def validate_prerequisites(self) -> bool:
        """Validate all required services and configurations."""
        logger.info("🔍 Validating prerequisites...")
        
        errors = []
        
        # Check MongoDB connection
        try:
            from pymongo import MongoClient
            client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
            client.server_info()
            logger.info(f"✓ MongoDB connected: {settings.MONGO_URI}")
        except Exception as e:
            errors.append(f"MongoDB connection failed: {str(e)}")
            logger.error(f"✗ MongoDB connection error: {str(e)}")
        
        # Check Express API availability
        try:
            import httpx
            client = httpx.Client(timeout=5.0)
            response = client.get(f"{settings.EXPRESS_API_URL.replace('/api', '')}/health")
            if response.status_code == 200:
                logger.info(f"✓ Express API healthy: {settings.EXPRESS_API_URL}")
            else:
                errors.append(f"Express API returned status {response.status_code}")
                logger.warning(f"⚠️  Express API health check returned {response.status_code}")
        except Exception as e:
            errors.append(f"Express API unreachable: {str(e)}")
            logger.warning(f"⚠️  Express API connection failed: {str(e)} (will retry at runtime)")
        
        # Check Ollama availability
        try:
            import ollama
            client = ollama.Client(host=settings.OLLAMA_BASE_URL)
            models = client.list()
            if models.get('models'):
                logger.info(f"✓ Ollama available at {settings.OLLAMA_BASE_URL}")
                model_names = [m.get('name', 'unknown') for m in models.get('models', [])]
                logger.info(f"  Available models: {', '.join(model_names[:3])}...")
            else:
                errors.append("Ollama has no models installed")
                logger.error("✗ No models available in Ollama")
        except Exception as e:
            errors.append(f"Ollama unreachable: {str(e)}")
            logger.error(f"✗ Ollama connection failed: {str(e)}")
        
        if errors:
            logger.warning("⚠️  Prerequisite validation warnings:")
            for error in errors:
                logger.warning(f"   - {error}")
            return False
        
        logger.info("✓ All prerequisites validated successfully!")
        return True
    
    async def initialize_mcp_servers(self):
        """Initialize all MCP servers."""
        logger.info("🚀 Initializing MCP servers...")
        
        try:
            # Task Retriever Server
            logger.info("  • Initializing TaskRetriever MCP server...")
            logger.info(f"    Available tools: {', '.join(task_retriever.tools.keys())}")
            
            # Project Auditor Server
            logger.info("  • Initializing ProjectAuditor MCP server...")
            logger.info(f"    Available tools: {', '.join(project_auditor.tools.keys())}")
            
            # Report Synthesizer Server
            logger.info("  • Initializing ReportSynthesizer MCP server...")
            logger.info(f"    Available tools: {', '.join(report_synthesizer.tools.keys())}")
            
            logger.info("✓ All MCP servers initialized successfully!")
            
        except Exception as e:
            logger.error(f"✗ Failed to initialize MCP servers: {str(e)}")
            raise
    
    async def initialize_orchestrator(self):
        """Initialize the multi-agent orchestrator."""
        logger.info("🧠 Initializing Multi-Agent Orchestrator...")
        
        try:
            self.orchestrator = MultiAgentOrchestrator()
            logger.info("✓ Orchestrator initialized with workflow:")
            logger.info("  • retrieve_data → analyze → synthesize → finalize")
            logger.info(f"  • LLM Model: {settings.MODEL}")
            logger.info(f"  • Ollama URL: {settings.OLLAMA_BASE_URL}")
        except Exception as e:
            logger.error(f"✗ Failed to initialize orchestrator: {str(e)}")
            raise
    
    async def initialize_fastapi(self):
        """Initialize and return FastAPI application."""
        logger.info("🌐 Initializing FastAPI application...")
        
        try:
            from api.main import app
            logger.info("✓ FastAPI app initialized")
            logger.info(f"  • Service: Team Task Manager - AI Swarm")
            logger.info(f"  • Port: {settings.FASTAPI_PORT}")
            logger.info(f"  • Endpoints: /health, /api/swarm/query")
            logger.info(f"  • CORS origins: http://localhost:5173, http://localhost:5000")
            return app
        except Exception as e:
            logger.error(f"✗ Failed to initialize FastAPI app: {str(e)}")
            raise
    
    async def startup(self):
        """Execute startup sequence."""
        logger.info("\n" + "="*70)
        logger.info("🚀 AI SWARM SERVICE STARTUP")
        logger.info("="*70)
        
        try:
            # Validate prerequisites
            if not self.validate_prerequisites():
                logger.warning("⚠️  Some prerequisites failed, but continuing anyway...")
            
            # Initialize components
            await self.initialize_mcp_servers()
            await self.initialize_orchestrator()
            app = await self.initialize_fastapi()
            
            self.running = True
            logger.info("\n" + "="*70)
            logger.info("✓ STARTUP COMPLETE - Service ready!")
            logger.info("="*70)
            logger.info("\n📊 Service Status:")
            logger.info(f"  • Express API: {settings.EXPRESS_API_URL}")
            logger.info(f"  • MongoDB: {settings.MONGO_URI}")
            logger.info(f"  • Ollama: {settings.OLLAMA_BASE_URL} ({settings.MODEL})")
            logger.info(f"  • FastAPI Server: http://0.0.0.0:{settings.FASTAPI_PORT}")
            logger.info("\n🔗 Quick Links:")
            logger.info(f"  • Health Check: http://localhost:{settings.FASTAPI_PORT}/health")
            logger.info(f"  • API Endpoint: http://localhost:{settings.FASTAPI_PORT}/api/swarm/query")
            logger.info(f"  • Frontend: http://localhost:5173")
            logger.info("\n💡 Example Request:")
            logger.info("  curl -X POST http://localhost:8000/api/swarm/query \\")
            logger.info("    -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\")
            logger.info("    -H 'Content-Type: application/json' \\")
            logger.info("    -d '{\"query\": \"What is my workload?\", \"user_id\": \"USER_ID\", \"context\": \"dashboard\"}'")
            logger.info("\n" + "="*70 + "\n")
            
            return app
            
        except Exception as e:
            logger.error(f"\n✗ STARTUP FAILED: {str(e)}")
            logger.error("="*70)
            raise
    
    async def run_server(self, app):
        """Run the FastAPI server."""
        import uvicorn
        
        config = uvicorn.Config(
            app=app,
            host="0.0.0.0",
            port=settings.FASTAPI_PORT,
            log_level="info",
            access_log=True,
            reload=False
        )
        
        server = uvicorn.Server(config)
        
        try:
            await server.serve()
        except KeyboardInterrupt:
            logger.info("Server shutdown requested")
            await server.shutdown()
        except Exception as e:
            logger.error(f"Server error: {str(e)}")
            raise
    
    async def run(self):
        """Main entry point."""
        try:
            app = await self.startup()
            await self.run_server(app)
        except KeyboardInterrupt:
            logger.info("\n🛑 Service interrupted by user")
            sys.exit(0)
        except Exception as e:
            logger.error(f"\n❌ Fatal error: {str(e)}", exc_info=True)
            sys.exit(1)
        finally:
            logger.info("\n" + "="*70)
            logger.info("🛑 AI SWARM SERVICE SHUTDOWN")
            logger.info("="*70)


async def main():
    """Application entry point."""
    service = AISwarmService()
    await service.run()


if __name__ == "__main__":
    # Display system information
    logger.info(f"Python version: {sys.version.split()[0]}")
    logger.info(f"Current directory: {os.getcwd()}")
    
    # Run the service
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Application terminated by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Application error: {str(e)}", exc_info=True)
        sys.exit(1)
