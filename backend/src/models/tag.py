from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum
import uuid


class TagBase(SQLModel):
    name: str = Field(min_length=1, max_length=50)
    color: Optional[str] = Field(default=None)  # Hex color code
    user_id: uuid.UUID = Field(foreign_key="user.id")


class Tag(TagBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationship with tasks (many-to-many through TaskTagLink)
    tasks: List["Task"] = Relationship(back_populates="tags", link_model="TaskTagLink")


class TagCreate(TagBase):
    pass


class TagUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    color: Optional[str] = Field(default=None)  # Hex color code


class TagRead(TagBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime