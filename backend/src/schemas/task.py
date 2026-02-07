from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from enum import Enum
import uuid


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    user_id: uuid.UUID
    recurrence_pattern: Optional[dict] = None  # For recurring tasks


class TaskCreate(TaskBase):
    tag_ids: Optional[List[uuid.UUID]] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    recurrence_pattern: Optional[dict] = None
    tag_ids: Optional[List[uuid.UUID]] = []


class TaskRead(TaskBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    tag_ids: Optional[List[uuid.UUID]] = []


class TaskReadWithTags(TaskRead):
    tag_names: List[str] = []