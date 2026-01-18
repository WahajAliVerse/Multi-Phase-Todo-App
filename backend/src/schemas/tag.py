"""
Pydantic schemas for Tag model in the todo application.
"""

from pydantic import BaseModel
from typing import List, Optional


class TagSchema(BaseModel):
    id: int
    name: str
    color: str
    user_id: int

    class Config:
        from_attributes = True


class TagCreateSchema(BaseModel):
    name: str
    color: str = "#007bff"


class TagUpdateSchema(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None