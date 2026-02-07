from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = "sqlite:///./todo_app.db"  # Default to SQLite for development
    SECRET_KEY: str = "your-default-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    NEON_DATABASE_URL: Optional[str] = None
    REDIS_URL: str = "redis://localhost:6379/0"

    # Email settings
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USERNAME: str = ""
    EMAIL_PASSWORD: str = ""
    EMAIL_SENDER: str = ""
    FRONTEND_BASE_URL: str = "http://localhost:3000"
    SUPPORT_EMAIL: str = "support@example.com"

    class Config:
        env_file = ".env"


settings = Settings()