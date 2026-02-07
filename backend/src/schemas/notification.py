from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from enum import Enum
import uuid


class NotificationType(str, Enum):
    EMAIL = "email"
    BROWSER = "browser"
    PUSH = "push"


class NotificationStatus(str, Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str
    user_id: uuid.UUID
    task_id: Optional[uuid.UUID] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    status: Optional[NotificationStatus] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None


class NotificationRead(NotificationBase):
    id: uuid.UUID
    status: NotificationStatus
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime