from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database.base import Base
from enum import Enum as PyEnum


class TaskStatus(PyEnum):
    active = "active"
    completed = "completed"


class TaskPriority(PyEnum):
    low = "low"
    medium = "medium"
    high = "high"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.active)
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    recurrence_pattern = Column(String, nullable=True)  # Cron-like pattern
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    version = Column(Integer, default=1)  # For optimistic locking

    # Relationships
    user = relationship("User", back_populates="tasks")
    tags = relationship("Tag", secondary="task_tags", back_populates="tasks")
    parent_task = relationship("Task", remote_side=[id], back_populates="child_tasks")
    child_tasks = relationship("Task", back_populates="parent_task")
    recurrence_pattern_rel = relationship("RecurrencePattern", back_populates="task", uselist=False, cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="task")


