from pydantic_settings import BaseSettings
from typing import List, Optional
from pydantic import field_validator
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "Todo API"
    API_V1_STR: str = "/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3002"]

    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")
    TEST_DATABASE_URL: str = os.getenv("TEST_DATABASE_URL", "sqlite:///./test_todo_app.db")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    model_config = {
        "env_file": ".env",
        "extra": "allow"  # Allow extra fields to prevent validation errors
    }


settings = Settings()