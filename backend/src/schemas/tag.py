from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TagBase(BaseModel):
    name: str
    color: str = "#007bff"


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class Tag(TagBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    version: int = 1

    class Config:
        from_attributes = True