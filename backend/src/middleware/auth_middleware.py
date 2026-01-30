from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session
from typing import Optional
from ..database.session import get_db
from ..auth.jwt import verify_token
from ..services.user_service import get_user_by_username
from ..models.user import User
from ..database.session import get_db


class CookieJWTBearer(HTTPBearer):
    """
    Custom JWT Bearer scheme that extracts token from cookies instead of Authorization header.
    """
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        # Try to get token from cookie
        token = request.cookies.get("access_token")
        
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No access token provided in cookies",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None
        
        return HTTPAuthorizationCredentials(
            scheme="Bearer", 
            credentials=token
        )


# Create an instance of the custom JWT Bearer
cookie_security = CookieJWTBearer()


def get_current_user_from_cookie(
    request: Request,
    credentials: HTTPAuthorizationCredentials = cookie_security
):
    """
    Get the current authenticated user from the JWT token in cookies.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = verify_token(credentials.credentials)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Get database session
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        user = get_user_by_username(db, username=username)
        if user is None:
            raise credentials_exception
        return user
    finally:
        db.close()


def verify_current_user_from_cookie(
    request: Request,
    credentials: HTTPAuthorizationCredentials = cookie_security
):
    """
    Verify that the current user is authenticated without returning user object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = verify_token(credentials.credentials)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Get database session
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        user = get_user_by_username(db, username=username)
        if user is None:
            raise credentials_exception
        return True  # User is authenticated
    finally:
        db.close()