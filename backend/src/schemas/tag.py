from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import uuid


class TagBase(BaseModel):
    name: str
    color: Optional[str] = None  # Hex color code
    user_id: uuid.UUID


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None  # Hex color code


class TagRead(TagBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime