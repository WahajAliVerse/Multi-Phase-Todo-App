"""
User authentication service for the todo application.
"""

from sqlalchemy.orm import Session
from typing import Optional
from ..models.user import User
from ..auth.jwt import verify_password


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """
    Retrieve a user by username.
    """
    return db.query(User).filter(User.username == username).first()


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    Authenticate a user by username and password.
    """
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user