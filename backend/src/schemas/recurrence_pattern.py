from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import uuid


class RecurrencePatternBase(BaseModel):
    frequency: str  # Enum: daily, weekly, monthly, yearly
    interval: int = 1  # How often the pattern repeats (every N days/weeks/etc)
    days_of_week: Optional[List[str]] = None  # For weekly: ['mon', 'wed', 'fri'] etc
    day_of_month: Optional[int] = None  # For monthly: 1-31
    end_condition: str = "never"  # Enum: never, after, on_date
    end_after_occurrences: Optional[int] = None  # Number of occurrences before stopping
    end_date: Optional[datetime] = None  # Date to stop recurrence


class RecurrencePatternCreate(RecurrencePatternBase):
    pass


class RecurrencePatternUpdate(BaseModel):
    frequency: Optional[str] = None  # Enum: daily, weekly, monthly, yearly
    interval: Optional[int] = None  # How often the pattern repeats (every N days/weeks/etc)
    days_of_week: Optional[List[str]] = None  # For weekly: ['mon', 'wed', 'fri'] etc
    day_of_month: Optional[int] = None  # For monthly: 1-31
    end_condition: Optional[str] = None  # Enum: never, after, on_date
    end_after_occurrences: Optional[int] = None  # Number of occurrences before stopping
    end_date: Optional[datetime] = None  # Date to stop recurrence


class RecurrencePatternRead(RecurrencePatternBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime