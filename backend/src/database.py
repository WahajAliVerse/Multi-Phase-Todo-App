"""
Database connection and session management.

This module sets up the database connection using SQLAlchemy
following the requirements from the data model and plan.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")

# Create engine with appropriate settings based on database type
if DATABASE_URL.startswith("postgresql"):
    # PostgreSQL settings
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=300
    )
else:
    # SQLite settings (default)
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}  # Required for SQLite
    )

# Create session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency function that provides database sessions.
    
    This function is meant to be used as a FastAPI dependency
    to provide database sessions to API endpoints.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Function to initialize database tables
def init_db():
    """
    Initialize the database tables.
    
    This function creates all tables defined in the models.
    It should be called when starting the application.
    """
    Base.metadata.create_all(bind=engine)