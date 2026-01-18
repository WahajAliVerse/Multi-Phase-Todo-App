"""
Password hashing utilities for the todo application.
"""

from passlib.context import CryptContext

# Password hashing context - using sha256_crypt as bcrypt is causing issues
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a plain password.
    """
    return pwd_context.hash(password)