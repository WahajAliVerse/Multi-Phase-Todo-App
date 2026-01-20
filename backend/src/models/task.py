"""
Task model for the todo application.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from src.database.base import Base, TimestampMixin
from datetime import datetime
from typing import Optional
import enum


class TaskStatus(str, enum.Enum):
    active = "active"
    completed = "completed"


class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.active)
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    recurrence_pattern = Column(String, nullable=True)  # Cron-like pattern
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)

    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="tasks")
    tags = relationship("Tag", secondary="task_tags", back_populates="tasks")
    child_tasks = relationship("Task", backref="parent_task", remote_side=[id])
    recurrence_pattern_rel = relationship("RecurrencePattern", back_populates="task", uselist=False, cascade="all, delete-orphan")