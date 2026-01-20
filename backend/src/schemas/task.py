"""
Pydantic schemas for the todo application.
"""

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


class TagSchema(BaseModel):
    id: int
    name: str
    color: str

    class Config:
        from_attributes = True


class TaskSchema(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    recurrence_pattern: Optional[str] = None
    user_id: int
    tags: List[TagSchema] = []

    class Config:
        from_attributes = True


class TaskCreateSchema(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[datetime] = None
    tag_ids: Optional[List[int]] = []


class TaskUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    tag_ids: Optional[List[int]] = []


class UserSchema(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True


class UserCreateSchema(BaseModel):
    username: str
    email: str
    password: str


class UserLoginSchema(BaseModel):
    username: str
    password: str


class TokenSchema(BaseModel):
    access_token: str
    token_type: str


class TokenDataSchema(BaseModel):
    username: Optional[str] = None