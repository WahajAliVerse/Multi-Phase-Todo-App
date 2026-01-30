from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..database.database import Base

class RecurrencePattern(Base):
    __tablename__ = "recurrence_patterns"

    id = Column(Integer, primary_key=True, index=True)
    pattern_type = Column(String(20), nullable=False)  # 'daily', 'weekly', 'monthly', 'yearly'
    interval = Column(Integer, nullable=False)  # How often the pattern repeats (every N days/weeks/etc)
    end_condition = Column(String(20), nullable=False)  # 'never', 'after_occurrences', 'on_date'
    occurrence_count = Column(Integer, nullable=True)  # For 'after_occurrences' condition
    end_date = Column(DateTime, nullable=True)  # For 'on_date' condition
    days_of_week = Column(String, nullable=True)  # For weekly patterns (e.g., 'mon,tue,fri')
    days_of_month = Column(String, nullable=True)  # For monthly patterns (e.g., '1,15')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())