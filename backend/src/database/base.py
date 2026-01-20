"""
Base model for all SQLAlchemy models in the todo application.
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime, func


Base = declarative_base()


class TimestampMixin:
    """
    Mixin class to add timestamp fields to models.
    """
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())