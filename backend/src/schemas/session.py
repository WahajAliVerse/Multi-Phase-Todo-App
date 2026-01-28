from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .tag import Tag


class SessionBase(BaseModel):
    user_id: int
    token_hash: str
    expires_at: datetime


class SessionCreate(SessionBase):
    device_info: Optional[str] = None
    ip_address: Optional[str] = None


class Session(SessionBase):
    id: int
    created_at: datetime
    last_accessed: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReminderBase(BaseModel):
    task_id: int
    scheduled_time: datetime


class ReminderCreate(ReminderBase):
    notification_type: Optional[str] = "in_app"


class ReminderUpdate(BaseModel):
    scheduled_time: Optional[datetime] = None
    delivery_status: Optional[str] = None
    notification_type: Optional[str] = None


class Reminder(ReminderBase):
    id: int
    delivery_status: str = "pending"
    notification_type: str = "in_app"
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RecurrencePatternBase(BaseModel):
    pattern_type: str
    interval: int = 1
    end_condition: str = "never"


class RecurrencePatternCreate(RecurrencePatternBase):
    end_date: Optional[datetime] = None
    max_occurrences: Optional[int] = None


class RecurrencePatternUpdate(BaseModel):
    pattern_type: Optional[str] = None
    interval: Optional[int] = None
    end_condition: Optional[str] = None
    end_date: Optional[datetime] = None
    max_occurrences: Optional[int] = None


class RecurrencePattern(RecurrencePatternBase):
    id: int
    task_id: int
    end_date: Optional[datetime] = None
    max_occurrences: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    version: int = 1

    class Config:
        from_attributes = True