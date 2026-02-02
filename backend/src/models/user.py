"""
User model for the application.

This module implements the User entity with all required fields and validation
as specified in the data model.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..database import Base
from passlib.context import CryptContext
from typing import Optional
import uuid


# Initialize password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    """
    User model representing a person using the application.
    
    Contains authentication credentials (username, email, hashed password),
    preferences (theme, notification settings), and associated tasks.
    """
    __tablename__ = "users"

    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Authentication credentials
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    
    # Account status
    is_active = Column(Boolean, default=True)
    
    # Preferences (stored as JSON text)
    preferences = Column(String, nullable=True)  # JSON string for preferences
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

    def set_password(self, password: str) -> None:
        """
        Hash and set the user's password.
        
        Args:
            password: Plain text password to hash and store
        """
        self.hashed_password = pwd_context.hash(password)

    def verify_password(self, password: str) -> bool:
        """
        Verify a plain text password against the stored hash.
        
        Args:
            password: Plain text password to verify
            
        Returns:
            bool: True if the password matches, False otherwise
        """
        return pwd_context.verify(password, self.hashed_password)

    @staticmethod
    def validate_username(username: str) -> bool:
        """
        Validate the username according to the specified rules.
        
        Args:
            username: Username to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        if not username:
            return False
        if len(username) < 3 or len(username) > 50:
            return False
        # Additional validation could be added here
        return True

    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Validate the email according to standard format.
        
        Args:
            email: Email to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None