"""
User authentication API routes for the todo application.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from src.database.session import get_db
from src.auth.jwt import create_access_token
from src.auth.hashing import get_password_hash, verify_password
from src.schemas.user import UserCreateSchema, TokenSchema
from src.models.user import User
from src.services.user_service import get_user_by_username, create_user

router = APIRouter()


@router.post("/register", response_model=TokenSchema)
def register_user(user_data: UserCreateSchema, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    # Check if user already exists
    existing_user = get_user_by_username(db, user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Create new user
    user = create_user(
        db=db,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password  # Pass raw password, service will hash it
    )

    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# Request model for login
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login", response_model=TokenSchema)
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login a user and return access token.
    """
    user = get_user_by_username(db, login_data.username)
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=TokenSchema)
def refresh_access_token(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh the access token using the refresh token.
    """
    from src.auth.jwt import verify_refresh_token

    # Verify the refresh token
    username = verify_refresh_token(token_data.refresh_token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get the user from the database
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create a new access token
    new_access_token = create_access_token(data={"sub": user.username})
    return {"access_token": new_access_token, "token_type": "bearer"}