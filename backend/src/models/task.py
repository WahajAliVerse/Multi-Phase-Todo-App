from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
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


class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None)
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    due_date: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    recurrence_pattern_id: Optional[uuid.UUID] = Field(default=None, foreign_key="recurrencepattern.id")


class Task(TaskBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationship with recurrence pattern
    recurrence_pattern: Optional["RecurrencePattern"] = Relationship(back_populates="tasks")
    
    # Relationship with tags (many-to-many through TaskTagLink)
    tags: List["Tag"] = Relationship(back_populates="tasks", link_model="TaskTagLink")


# Link model for many-to-many relationship between Task and Tag
class TaskTagLink(SQLModel, table=True):
    task_id: uuid.UUID = Field(foreign_key="task.id", primary_key=True)
    tag_id: uuid.UUID = Field(foreign_key="tag.id", primary_key=True)


class TaskCreate(TaskBase):
    tag_ids: Optional[List[uuid.UUID]] = []
    recurrence_pattern_id: Optional[uuid.UUID] = None


class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None)
    status: Optional[TaskStatus] = Field(default=None)
    priority: Optional[TaskPriority] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    tag_ids: Optional[List[uuid.UUID]] = []
    recurrence_pattern_id: Optional[uuid.UUID] = None


class TaskRead(TaskBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    tag_ids: Optional[List[uuid.UUID]] = []
    recurrence_pattern_id: Optional[uuid.UUID] = None