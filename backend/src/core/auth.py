from datetime import timedelta
from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer
from sqlmodel import Session
from src.core.database import get_session
from src.core.security import (
    authenticate_user,
    create_access_token,
    verify_token,
    create_session_cookie
)
from src.models.user import User
from src.services.user_service import UserService


security = HTTPBearer(auto_error=False)


def login_user(response: Response, email: str, password: str, session: Session):
    """
    Authenticate user and create session
    """
    user = authenticate_user(session, email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    create_session_cookie(response, access_token)
    
    return {"access_token": access_token, "token_type": "bearer"}


def logout_user(response: Response):
    """
    Clear the session cookie to log out the user
    """
    response.delete_cookie(key="access_token")
    return {"detail": "Logged out successfully"}


def get_current_user_from_token(
    request: Request, 
    session: Session = Depends(get_session)
) -> User:
    """
    Get the current user from the token in the session cookie
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Get token from cookie
    token = request.cookies.get("access_token")
    if not token:
        raise credentials_exception
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    user_service = UserService()
    user = user_service.get_user_by_email(session, email=email)
    if user is None:
        raise credentials_exception
    
    return user


def get_current_active_user(current_user: User = Depends(get_current_user_from_token)) -> User:
    """
    Get the current active user
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user