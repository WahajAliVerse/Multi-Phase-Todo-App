from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from ....database.session import get_db
from ....api.deps import get_current_user
from ....schemas.user import UserCreate, UserLogin, User as UserSchema, LoginResponse
from ....models.user import User as UserModel
from ....services.auth import create_user as service_create_user, login_user as service_login_user


router = APIRouter()


@router.post("/register", response_model=UserSchema)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    try:
        db_user = service_create_user(db, user)
        return db_user
    except HTTPException:
        # Re-raise HTTP exceptions from the service
        raise
    except Exception as e:
        # Handle any other exceptions
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


@router.post("/login", response_model=LoginResponse)
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return access and refresh tokens.
    """
    try:
        result = service_login_user(db, user_credentials.username, user_credentials.password)
        return result
    except HTTPException:
        # Re-raise HTTP exceptions from the service
        raise
    except Exception as e:
        # Handle any other exceptions
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )


@router.get("/profile", response_model=UserSchema)
def get_profile(current_user: UserModel = Depends(get_current_user)):
    """
    Get current user's profile.
    """
    return current_user