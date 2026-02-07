from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
import os
from src.models.user import User
from src.services.user_service import UserService


# Initialize password hashing context
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "argon2", "bcrypt"], deprecated="auto")

# Initialize JWT token scheme
security = HTTPBearer()


# Configuration from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-default-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a JWT access token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """
    Verify a JWT token and return the payload if valid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(request: Request, session: Session) -> User:
    """
    Get the current user based on the JWT token in the request
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


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password
    """
    user_service = UserService()
    user = user_service.get_user_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_session_cookie(response, token: str):
    """
    Create an HTTP-only session cookie with the access token
    """
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,  # Set to True in production with HTTPS
        samesite="strict",
        max_age=1800  # 30 minutes
    )


def verify_password_strength(password: str) -> tuple[bool, str]:
    """
    Verify that a password meets minimum strength requirements
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    if not (has_upper and has_lower and has_digit and has_special):
        return False, "Password must contain uppercase, lowercase, digit, and special character"
    
    return True, ""