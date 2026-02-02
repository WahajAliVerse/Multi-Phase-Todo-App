import os
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from typing import Optional
from ....database.session import get_db
from ....models.user import User as UserModel
from ....services.auth_service import AuthService, get_auth_service
from ....core.security import create_access_token, create_refresh_token, verify_token
from ....schemas.user import UserCreate, UserLogin
from datetime import timedelta
from jose import jwt


router = APIRouter()


@router.post("/login")
def login(
    response: Response,
    user_credentials: UserLogin,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authenticate user and set JWT tokens in HTTP-only cookies.
    """
    user = auth_service.authenticate_user(user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access and refresh tokens using core security functions
    from ....core.config import settings
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},  # Using user ID instead of username for security
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)}   # Using user ID instead of username for security
    )

    # Determine if we should use secure cookies based on environment
    is_secure = os.getenv("ENVIRONMENT", "development") == "production"

    # Set tokens in HTTP-only cookies with security flags
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_secure,  # Set to True for HTTPS in production
        samesite="lax",  # Changed to "lax" for better UX while maintaining security
        max_age=1800  # 30 minutes in seconds
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_secure,  # Set to True for HTTPS in production
        samesite="lax",  # Changed to "lax" for better UX while maintaining security
        max_age=604800  # 7 days in seconds
    )

    return {"message": "Login successful", "user_id": user.id}


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Register a new user.
    """
    try:
        created_user = auth_service.create_user(
            user.username,
            user.email,
            user.password
        )
        return {"message": "User created successfully", "user_id": created_user.id}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Handle any other exceptions
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


@router.post("/logout")
def logout(response: Response):
    """
    Logout user by clearing HTTP-only cookies.
    """
    # Determine if we should use secure cookies based on environment
    is_secure = os.getenv("ENVIRONMENT") == "production"

    # Clear the authentication cookies
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=is_secure,  # Set to True for HTTPS in production
        samesite="lax",
        max_age=0,
        expires="Thu, 01 Jan 1970 00:00:00 GMT"
    )

    response.set_cookie(
        key="refresh_token",
        value="",
        httponly=True,
        secure=is_secure,  # Set to True for HTTPS in production
        samesite="lax",
        max_age=0,
        expires="Thu, 01 Jan 1970 00:00:00 GMT"
    )

    return {"message": "Logged out successfully"}


@router.post("/refresh")
def refresh_token_route(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token from HTTP-only cookie.
    """
    # Get refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )

    try:
        # Use the core verify_token function instead of direct jwt.decode
        payload = verify_token(refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        token_type = payload.get("type")
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token type",
            )

        user_id: str = payload.get("sub")  # Using sub field which now contains user ID
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Verify user still exists
    user = db.query(UserModel).filter(UserModel.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    # Create new access token using core security functions
    from ....core.config import settings
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={"sub": str(user.id)},  # Using user ID for consistency
        expires_delta=access_token_expires
    )

    # Determine if we should use secure cookies based on environment
    is_secure = os.getenv("ENVIRONMENT", "development") == "production"

    # Set new access token in cookie
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=is_secure,  # Set to True for HTTPS in production
        samesite="lax",
        max_age=1800  # 30 minutes
    )

    return {"message": "Token refreshed successfully", "user_id": user.id}


@router.get("/me")
def get_current_user(request: Request, db: Session = Depends(get_db)):
    """
    Get current authenticated user based on access token in cookie.
    """
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

    user_id: str = payload.get("sub")  # Using sub field which contains user ID

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )

    user = db.query(UserModel).filter(UserModel.id == int(user_id)).first()
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