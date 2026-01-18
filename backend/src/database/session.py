"""
Database session management for the todo application.
"""

from .connection import SessionLocal


def get_db():
    """
    Dependency to get database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()