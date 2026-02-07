from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import JSON
from passlib.context import CryptContext
import uuid

if TYPE_CHECKING:
    from src.models.notification import Notification


pwd_context = CryptContext(schemes=["pbkdf2_sha256", "argon2", "bcrypt"], deprecated="auto")


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = Field(default=True)
    theme_preference: str = Field(default="light")  # Enum: 'light', 'dark'
    notification_settings: dict = Field(default={"email": True, "browser": True}, sa_type=JSON)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationship with notifications
    notifications: list["Notification"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=72)


class UserUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    theme_preference: Optional[str] = None
    notification_settings: Optional[dict] = None
    is_active: Optional[bool] = None


class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    # Truncate password to 72 characters to comply with bcrypt limitations
    truncated_password = password[:72] if len(password) > 72 else password
    # Use the password context which has fallback schemes
    return pwd_context.hash(truncated_password)