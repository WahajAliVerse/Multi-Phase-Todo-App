"""
User model for the todo application.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from src.database.base import Base, TimestampMixin
from typing import Optional


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    preferences = Column(Text)  # JSON string for user preferences

    # Relationships
    tasks = relationship("Task", back_populates="user")
    tags = relationship("Tag", back_populates="user")