from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RecurrencePatternBase(BaseModel):
    pattern_type: str  # 'daily', 'weekly', 'monthly', 'yearly'
    interval: int = 1  # How often to repeat (every N days/weeks/etc)
    end_date: Optional[datetime] = None  # When to stop recurrence
    occurrences_count: Optional[int] = None  # Max number of occurrences


class RecurrencePatternCreate(RecurrencePatternBase):
    pass


class RecurrencePatternUpdate(BaseModel):
    pattern_type: Optional[str] = None
    interval: Optional[int] = None
    end_date: Optional[datetime] = None
    occurrences_count: Optional[int] = None


class RecurrencePatternInDBBase(RecurrencePatternBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        from_attributes = True


class RecurrencePattern(RecurrencePatternInDBBase):
    pass