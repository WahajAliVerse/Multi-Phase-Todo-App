"""
Configuration settings for the application.

This module manages environment variables and configuration settings
as specified in the requirements.
"""

import os
from typing import List, Optional
from pydantic import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    # Application
    APP_NAME: str = "Todo App"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:8080",
        "https://localhost",
        "https://localhost:3000",
        "https://localhost:3001",
        "https://localhost:3002",
        "https://localhost:8080"
    ]
    
    # JWT
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Performance
    MAX_TASKS_PER_REQUEST: int = 100
    DEFAULT_PAGE_SIZE: int = 20
    
    class Config:
        env_file = ".env"


# Create a global settings instance
settings = Settings()


# Validate critical settings
def validate_settings():
    """
    Validate that critical settings are properly configured.
    
    Raises:
        ValueError: If critical settings are missing or invalid
    """
    if not settings.SECRET_KEY and settings.ENVIRONMENT == "production":
        raise ValueError("SECRET_KEY must be set in production environment")
    
    if not settings.DATABASE_URL:
        raise ValueError("DATABASE_URL must be set")


# Validate settings on module import
validate_settings()