from datetime import timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.user import User
from schemas.user import UserCreate, UserInDB
from core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from core.config import settings


def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(db: Session, user: UserCreate):
    # Check if user already exists
    existing_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create new user
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def login_user(db: Session, username: str, password: str):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        subject=str(user.id)
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def update_user(db: Session, user_id: int, user_update):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields if provided
    if user_update.username:
        # Check if new username is already taken
        existing_user = db.query(User).filter(User.username == user_update.username).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already in use"
            )
        db_user.username = user_update.username
    
    if user_update.email:
        # Check if new email is already taken
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        db_user.email = user_update.email
    
    if user_update.preferences is not None:
        db_user.preferences = user_update.preferences
    
    db.commit()
    db.refresh(db_user)
    return db_user