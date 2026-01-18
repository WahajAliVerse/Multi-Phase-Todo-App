from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Todo API"
    API_V1_STR: str = "/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3003", "http://localhost:3004", "http://127.0.0.1:3000", "http://127.0.0.1:3003", "http://127.0.0.1:3004"]  # Update this list with your frontend URLs

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str
    TEST_DATABASE_URL: str
    DEBUG: bool = False

    class Config:
        env_file = ".env"


settings = Settings()