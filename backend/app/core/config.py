import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Policy & Compliance Assistant"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # SQLite Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./policy_assistant_v2.db")
    
    # Gemini API Key (for future use)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

    class Config:
        env_file = ".env"

settings = Settings()
