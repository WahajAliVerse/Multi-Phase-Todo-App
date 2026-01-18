from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any
from ..database.session import get_db
from ..schemas.user import UserCreate, User
from ..schemas.token import Token
from ..services.auth import create_user, login_user
from ..api.deps import get_current_user


router = APIRouter()


@router.post("/register", response_model=User)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user
    """
    try:
        return create_user(db, user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login with username and password
    """
    result = login_user(db, form_data.username, form_data.password)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return result


@router.post("/refresh")
def refresh_token(token: str):
    """
    Refresh the access token using the refresh token
    """
    # This would typically involve validating the refresh token
    # and issuing a new access token
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Refresh token functionality not yet implemented"
    )