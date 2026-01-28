from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    active = "active"
    completed = "completed"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.active
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[datetime] = None
    recurrence_pattern: Optional[str] = None  # Cron-like pattern


class TaskCreate(TaskBase):
    tag_ids: Optional[List[int]] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    tag_ids: Optional[List[int]] = None


class Tag(BaseModel):
    id: int
    name: str
    color: str
    user_id: int

    class Config:
        from_attributes = True


class Task(TaskBase):
    id: int
    user_id: int
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    version: int = 1
    tags: List[Tag] = []

    class Config:
        from_attributes = True


class PaginatedTasks(BaseModel):
    tasks: List[Task]
    total: int
    skip: int
    limit: int