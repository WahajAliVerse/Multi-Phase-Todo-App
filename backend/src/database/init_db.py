import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import all models to register them with Base metadata
from ..models.user import User
from ..models.task import Task
from ..models.tag import Tag
from ..models.recurrence_pattern import RecurrencePattern
from ..models.task_tag import TaskTag

from ..database.base import Base
from ..core.config import settings


def init_db():
    """Initialize the database with tables"""
    engine = create_engine(settings.DATABASE_URL)

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()