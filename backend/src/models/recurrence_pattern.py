"""
RecurrencePattern model for the todo application.
"""

from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from src.database.base import Base, TimestampMixin
from datetime import datetime
from typing import TYPE_CHECKING
import enum

if TYPE_CHECKING:
    from .task import Task


class RecurrencePatternType(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class EndCondition(str, enum.Enum):
    never = "never"
    after_date = "after_date"
    after_occurrences = "after_occurrences"


class RecurrencePattern(Base, TimestampMixin):
    __tablename__ = "recurrence_patterns"

    id = Column(Integer, primary_key=True, index=True)
    pattern_type = Column(Enum(RecurrencePatternType), nullable=False)
    interval = Column(Integer, default=1)  # How often the pattern repeats (e.g., every 2 weeks)
    end_condition = Column(Enum(EndCondition), default=EndCondition.never)
    end_date = Column(DateTime, nullable=True)  # Date when recurrence stops
    max_occurrences = Column(Integer, nullable=True)  # Max number of occurrences

    # Relationships
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    task = relationship("Task", back_populates="recurrence_pattern_rel")