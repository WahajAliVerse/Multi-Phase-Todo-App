import os
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from typing import Optional
from ....database.session import get_db
from ....models.user import User as UserModel
from ....services.auth_service import AuthService, get_auth_service
from ....auth.jwt import create_access_token, create_refresh_token, verify_token
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
        secure=False,  # Set to True for HTTPS in production
        samesite="lax",  # Changed to "lax" for better UX while maintaining security
        max_age=1800  # 30 minutes in seconds
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True for HTTPS in production
        samesite="lax",  # Changed to "lax" for better UX while maintaining security
        max_age=604800  # 7 days in seconds
    )

    return {"message": "Login successful"}


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
    # Clear the authentication cookies
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=False,  # Set to True for HTTPS in production
        samesite="lax",
        max_age=0,
        expires="Thu, 01 Jan 1970 00:00:00 GMT"
    )

    response.set_cookie(
        key="refresh_token",
        value="",
        httponly=True,
        secure=False,  # Set to True for HTTPS in production
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
        payload = jwt.decode(
            refresh_token,
            os.getenv("SECRET_KEY", "your-super-secret-key-here"),
            algorithms=[os.getenv("ALGORITHM", "HS256")]
        )
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
    user = db.query(UserModel).filter(UserModel.username == username).first()
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
        secure=False,  # Set to True for HTTPS in production
        samesite="lax",
        max_age=1800  # 30 minutes
    )

    return {"message": "Token refreshed successfully"}


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

    username: str = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )

    user = db.query(UserModel).filter(UserModel.username == username).first()
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