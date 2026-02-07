from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import JSON
import uuid

if TYPE_CHECKING:
    from src.models.task import Task


class RecurrencePatternBase(SQLModel):
    frequency: str = Field(regex=r"^(daily|weekly|monthly|yearly)$")  # Enum: daily, weekly, monthly, yearly
    interval: int = Field(default=1, ge=1)  # How often the pattern repeats (every N days/weeks/etc)
    days_of_week: Optional[List[str]] = Field(default=None, sa_type=JSON)  # For weekly: ['mon', 'wed', 'fri'] etc
    day_of_month: Optional[int] = Field(default=None, ge=1, le=31)  # For monthly: 1-31
    end_condition: str = Field(default="never", regex=r"^(never|after|on_date)$")  # Enum: never, after, on_date
    end_after_occurrences: Optional[int] = Field(default=None, ge=1)  # Number of occurrences before stopping
    end_date: Optional[datetime] = Field(default=None)  # Date to stop recurrence
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class RecurrencePattern(RecurrencePatternBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # Relationship to tasks that use this pattern
    tasks: List["Task"] = Relationship(back_populates="recurrence_pattern")


class RecurrencePatternCreate(RecurrencePatternBase):
    pass


class RecurrencePatternUpdate(SQLModel):
    frequency: Optional[str] = Field(default=None, regex=r"^(daily|weekly|monthly|yearly)$")
    interval: Optional[int] = Field(default=None, ge=1)
    days_of_week: Optional[List[str]] = Field(default=None, sa_type=JSON)
    day_of_month: Optional[int] = Field(default=None, ge=1, le=31)
    end_condition: Optional[str] = Field(default=None, regex=r"^(never|after|on_date)$")
    end_after_occurrences: Optional[int] = Field(default=None, ge=1)
    end_date: Optional[datetime] = Field(default=None)


class RecurrencePatternRead(RecurrencePatternBase):
    id: uuid.UUID