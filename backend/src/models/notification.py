from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
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


class NotificationBase(SQLModel):
    type: NotificationType
    title: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1)
    status: NotificationStatus = Field(default=NotificationStatus.SENT)
    sent_at: Optional[datetime] = Field(default=None)
    delivered_at: Optional[datetime] = Field(default=None)
    read_at: Optional[datetime] = Field(default=None)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    task_id: Optional[uuid.UUID] = Field(default=None, foreign_key="task.id")


class Notification(NotificationBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationship with user who receives the notification
    user: "User" = Relationship(back_populates="notifications")

    # Relationship with task that triggered the notification (optional)
    task: Optional["Task"] = Relationship(back_populates="notifications")


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(SQLModel):
    status: Optional[NotificationStatus] = Field(default=None)
    delivered_at: Optional[datetime] = Field(default=None)
    read_at: Optional[datetime] = Field(default=None)


class NotificationRead(NotificationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime