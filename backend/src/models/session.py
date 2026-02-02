"""
Session model for the application.

This module implements the Session entity with all required fields and constraints
as specified in the data model.
"""

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from ..database import Base
from typing import Optional
import uuid


class Session(Base):
    """
    Session model representing an authenticated user session with JWT token and associated permissions.
    """
    __tablename__ = "sessions"

    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Token information
    token_hash = Column(String, unique=True, nullable=False, index=True)
    
    # Foreign key to user
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # Session status
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<Session(id={self.id}, user_id='{self.user_id}', expires_at='{self.expires_at}')>"

    def is_expired(self) -> bool:
        """
        Check if the session has expired.
        
        Returns:
            bool: True if the session has expired, False otherwise
        """
        from datetime import datetime
        return datetime.now().astimezone() > self.expires_at

    def is_valid(self) -> bool:
        """
        Check if the session is valid (not expired and not revoked).
        
        Returns:
            bool: True if the session is valid, False otherwise
        """
        return not self.is_expired() and not self.is_revoked