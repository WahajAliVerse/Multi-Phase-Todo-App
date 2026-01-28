from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database.base import Base
from enum import Enum as PyEnum


class RecurrencePatternType(PyEnum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class EndCondition(PyEnum):
    never = "never"
    after_date = "after_date"
    after_occurrences = "after_occurrences"


class RecurrencePattern(Base):
    __tablename__ = "recurrence_patterns"

    id = Column(Integer, primary_key=True, index=True)
    pattern_type = Column(Enum(RecurrencePatternType), nullable=False)
    interval = Column(Integer, default=1)  # How often the pattern repeats (e.g., every 2 weeks)
    end_condition = Column(Enum(EndCondition), default=EndCondition.never)
    end_date = Column(DateTime, nullable=True)  # Date when recurrence stops
    max_occurrences = Column(Integer, nullable=True)  # Max number of occurrences
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    version = Column(Integer, default=1)  # For optimistic locking

    # Relationships
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    task = relationship("Task", back_populates="recurrence_pattern_rel")


