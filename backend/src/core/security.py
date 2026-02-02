"""
Security module for JWT token handling and authentication.

This module consolidates JWT functionality following security-first approach
as specified in the research documentation.
"""

import os
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext

# Initialize password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Get secret key from environment, with fallback for development
SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    # Only for development - in production, this should be set in environment
    from secrets import token_urlsafe
    SECRET_KEY = token_urlsafe(32)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to compare against
    
    Returns:
        bool: True if the password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Generate a hash for the given password.
    
    Args:
        password: The plain text password to hash
    
    Returns:
        str: The hashed password
    """
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with the given data.
    
    Args:
        data: Dictionary containing the claims to include in the token
        expires_delta: Optional timedelta for token expiration (defaults to 30 minutes)
    
    Returns:
        str: The encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode a JWT access token and return its claims.
    
    Args:
        token: The JWT token to decode
    
    Returns:
        Optional[Dict]: The decoded token claims, or None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Check if token is an access token
        token_type = payload.get("type")
        if token_type != "access":
            return None
            
        # Check if token is expired
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
            return None
        
        return payload
    except jwt.exceptions.JWTError:
        # Invalid token
        return None


def authenticate_user(stored_hashed_password: str, provided_password: str) -> bool:
    """
    Authenticate a user by comparing the provided password with the stored hash.
    
    Args:
        stored_hashed_password: The hashed password stored in the database
        provided_password: The password provided by the user
    
    Returns:
        bool: True if authentication is successful, False otherwise
    """
    return verify_password(provided_password, stored_hashed_password)