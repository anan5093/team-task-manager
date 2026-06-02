from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # LLM - Ollama (local)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    MODEL: str = "tinyllama"
    
    # Service URLs
    EXPRESS_API_URL: str = "http://localhost:5000/api"
    FASTAPI_PORT: int = 8000
    
    # MongoDB
    MONGO_URI: str = "mongodb://127.0.0.1:27017/team-task-manager"
    
    # Security
    JWT_SECRET: str = "your-secret"
    AI_SERVICE_SECRET: str = "shared-secret"
    
    # OpenRouter Integration
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_MODEL: str = "deepseek/deepseek-r1:free"
    USE_OPENROUTER: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
