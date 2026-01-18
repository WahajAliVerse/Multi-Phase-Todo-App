"""
User service for the todo application.
"""

from sqlalchemy.orm import Session
from typing import Optional
from ..models.user import User
from ..auth.hashing import get_password_hash


def create_user(
    db: Session,
    username: str,
    email: str,
    password: str
) -> User:
    """
    Create a new user.
    """
    hashed_password = get_password_hash(password)
    db_user = User(
        username=username,
        email=email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user(db: Session, user_id: int) -> Optional[User]:
    """
    Get a user by ID.
    """
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """
    Get a user by username.
    """
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get a user by email.
    """
    return db.query(User).filter(User.email == email).first()


def update_user(
    db: Session,
    user_id: int,
    username: Optional[str] = None,
    email: Optional[str] = None,
    password: Optional[str] = None
) -> Optional[User]:
    """
    Update a user.
    """
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    if username:
        db_user.username = username
    if email:
        db_user.email = email
    if password:
        db_user.hashed_password = get_password_hash(password)
    
    db.commit()
    db.refresh(db_user)
    return db_user