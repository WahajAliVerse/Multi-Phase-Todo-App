"""
Pydantic schemas for the user model in the todo application.
"""

from pydantic import BaseModel
from typing import Optional


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


class UserUpdateSchema(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class TokenSchema(BaseModel):
    access_token: str
    token_type: str

    class Config:
        from_attributes = True


class TokenDataSchema(BaseModel):
    username: Optional[str] = None