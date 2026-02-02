from pydantic_settings import BaseSettings
from typing import List, Optional
from pydantic import field_validator
import os
import secrets


class Settings(BaseSettings):
    PROJECT_NAME: str = "Todo API"
    API_V1_STR: str = "/v1"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "https://yourdomain.com",  # Add your production domain
        "https://www.yourdomain.com"
    ]

    # Generate a strong secret key if not provided
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Rate limiting settings
    FAILED_LOGIN_ATTEMPTS_LIMIT: int = 5
    FAILED_LOGIN_WINDOW_SECONDS: int = 900  # 15 minutes

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")
    TEST_DATABASE_URL: str = os.getenv("TEST_DATABASE_URL", "sqlite:///./test_todo_app.db")

    # Redis settings for rate limiting and token blacklisting
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))

    # Debug mode
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # Environment (development/production)
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    model_config = {
        "env_file": ".env",
        "extra": "allow"  # Allow extra fields to prevent validation errors
    }

    @field_validator('BACKEND_CORS_ORIGINS')
    @classmethod
    def assemble_cors_origins(cls, v: List[str]) -> List[str]:
        """Validate and assemble CORS origins."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)


settings = Settings()