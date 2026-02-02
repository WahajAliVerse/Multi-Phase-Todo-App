"""
Authentication endpoints for the application.

This module implements authentication endpoints for register, login, logout
with HTTP-only cookie support as specified in the requirements.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from ..database import get_db
from ..services.auth_service import AuthService
from ..services.user_service import UserService
from ..models.user import User
from ..utils.responses import create_success_response, create_error_response
import logging


router = APIRouter()

# Security scheme for documentation purposes
security_scheme = HTTPBearer()


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    Args:
        request: Registration request with username, email, and password
        db: Database session dependency
        
    Returns:
        Success response with user information
    """
    logger = logging.getLogger(__name__)
    
    try:
        auth_service = AuthService(db)
        user = auth_service.register_user(
            request.username,
            request.email,
            request.password
        )
        
        if not user:
            return create_error_response(
                error_code="REGISTRATION_FAILED",
                message="Registration failed. Username or email may already exist.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Return success response without sensitive data
        return create_success_response(
            data={
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "created_at": user.created_at
            },
            message="User registered successfully"
        )
        
    except Exception as e:
        logger.error(f"Error during registration: {e}")
        return create_error_response(
            error_code="INTERNAL_ERROR",
            message="An internal server error occurred",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.post("/login")
def login(
    response: Response,
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate a user and set HTTP-only cookie with JWT token.
    
    Args:
        response: FastAPI response object to set cookies
        request: Login request with username and password
        db: Database session dependency
        
    Returns:
        Success response with user information
    """
    logger = logging.getLogger(__name__)
    
    try:
        auth_service = AuthService(db)
        result = auth_service.login_user(request.username, request.password)
        
        if not result:
            return create_error_response(
                error_code="INVALID_CREDENTIALS",
                message="Invalid username or password",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        
        user, access_token = result
        
        # Set HTTP-only cookie with JWT token
        # Using security best practices: Secure, HttpOnly, and SameSite flags
        response.set_cookie(
            key="access_token_cookie",
            value=access_token,
            httponly=True,  # Prevents client-side JavaScript access
            secure=True,    # Only sent over HTTPS (should be configurable for dev/prod)
            samesite="lax", # Protects against CSRF
            max_age=1800    # 30 minutes in seconds
        )
        
        # Return success response without sensitive data
        return create_success_response(
            data={
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "created_at": user.created_at
            },
            message="Login successful"
        )
        
    except Exception as e:
        logger.error(f"Error during login: {e}")
        return create_error_response(
            error_code="INTERNAL_ERROR",
            message="An internal server error occurred",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.post("/logout")
def logout(
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Log out the current user by clearing the authentication cookie.
    
    Args:
        response: FastAPI response object to clear cookies
        db: Database session dependency
        
    Returns:
        Success response
    """
    logger = logging.getLogger(__name__)
    
    try:
        # Clear the authentication cookie
        response.delete_cookie(
            key="access_token_cookie",
            path="/",
            domain=None
        )
        
        return create_success_response(
            message="Logout successful"
        )
        
    except Exception as e:
        logger.error(f"Error during logout: {e}")
        return create_error_response(
            error_code="INTERNAL_ERROR",
            message="An internal server error occurred",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/me")
def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get the current authenticated user's information.
    
    Args:
        request: FastAPI request object to get cookies
        db: Database session dependency
        
    Returns:
        Current user information
    """
    logger = logging.getLogger(__name__)
    
    try:
        # Get token from cookie
        token = request.cookies.get("access_token_cookie")
        
        if not token:
            return create_error_response(
                error_code="NO_AUTH_TOKEN",
                message="No authentication token provided",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        
        auth_service = AuthService(db)
        user = auth_service.get_current_user(token)
        
        if not user:
            return create_error_response(
                error_code="INVALID_TOKEN",
                message="Invalid or expired token",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        
        # Return user information
        return create_success_response(
            data={
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            },
            message="User information retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return create_error_response(
            error_code="INTERNAL_ERROR",
            message="An internal server error occurred",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )