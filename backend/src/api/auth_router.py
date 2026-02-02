import os
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import timedelta
from jose import jwt

from ..models.user import User
from ..database.database import get_db
from ..auth.jwt import create_access_token, create_refresh_token, verify_token
from ..services.auth_service import AuthService, get_auth_service
from ..services.user_service import UserService, get_user_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(
    response: Response,
    username: str,
    password: str,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Authenticate user and set JWT tokens in HTTP-only cookies."""
    user = auth_service.authenticate_user(username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=30)  # Configurable
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.username, "user_id": user.id}
    )

    # Set tokens in HTTP-only cookies with security flags
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # Set to True for HTTPS in production
        samesite="strict",  # Prevent CSRF
        max_age=1800  # 30 minutes in seconds
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # Set to True for HTTPS in production
        samesite="strict",  # Prevent CSRF
        max_age=604800  # 7 days in seconds
    )

    return {"message": "Login successful"}


@router.post("/register")
async def register(
    username: str,
    email: str,
    password: str,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Register a new user."""
    try:
        user = auth_service.create_user(username, email, password)
        return {"message": "User created successfully", "user_id": user.id}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing HTTP-only cookies."""
    # Clear the authentication cookies
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=0
    )

    response.set_cookie(
        key="refresh_token",
        value="",
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=0
    )

    return {"message": "Logged out successfully"}


@router.post("/refresh")
async def refresh_token_route(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token from HTTP-only cookie."""
    # Get refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )

    try:
        payload = jwt.decode(refresh_token, os.getenv("SECRET_KEY", "your-super-secret-key-here"), algorithms=[os.getenv("ALGORITHM", "HS256")])
        token_type = payload.get("type")
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token type",
            )

        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Verify user still exists
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    # Create new access token
    new_access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id}
    )

    # Set new access token in cookie
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=1800  # 30 minutes
    )

    return {"message": "Token refreshed successfully"}


@router.get("/me")
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Get current authenticated user based on access token in cookie."""
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No access token provided",
        )

    payload = verify_token(access_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )

    username: str = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email
    }