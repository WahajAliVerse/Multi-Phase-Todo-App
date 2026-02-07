import os
from sqlmodel import create_engine
from typing import Generator
from contextlib import contextmanager
from sqlalchemy.pool import QueuePool


# Database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")


# Create the database engine with connection pooling
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True to log SQL queries
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args=connect_args
)


def get_session() -> Generator:
    """
    Get a database session
    """
    from sqlmodel import Session
    
    with Session(engine) as session:
        yield session


@contextmanager
def get_db_session():
    """
    Context manager for database sessions
    """
    from sqlmodel import Session
    
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    """
    Initialize the database by creating all tables
    """
    from sqlmodel import SQLModel
    from src.models.user import User
    from src.models.task import Task
    from src.models.tag import Tag
    from src.models.notification import Notification
    
    # Create all tables
    SQLModel.metadata.create_all(engine)