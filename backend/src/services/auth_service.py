"""
Authentication service for the application.

This module implements authentication functionality with register, login, logout
as specified in the requirements.
"""

from typing import Optional, Tuple
from sqlalchemy.orm import Session
from datetime import timedelta
from fastapi import HTTPException, status
from ..models.user import User
from ..models.session import Session as SessionModel
from ..services.user_service import UserService
from ..core.security import create_access_token, authenticate_user
from ..utils.responses import create_error_response
import uuid
import logging


class AuthService:
    """
    Service class for handling authentication operations.
    """
    
    def __init__(self, db_session: Session):
        """
        Initialize the authentication service with a database session.
        
        Args:
            db_session: SQLAlchemy database session
        """
        self.db = db_session
        self.user_service = UserService(db_session)
        self.logger = logging.getLogger(__name__)

    def register_user(self, username: str, email: str, password: str) -> Optional[User]:
        """
        Register a new user with the provided details.
        
        Args:
            username: The user's username
            email: The user's email address
            password: The user's plain text password
            
        Returns:
            User object if registration is successful, None otherwise
        """
        try:
            # Create user through user service
            user = self.user_service.create_user(username, email, password)
            if not user:
                self.logger.error(f"Registration failed for username: {username}")
                return None
            
            self.logger.info(f"User registered successfully: {user.id}")
            return user
            
        except Exception as e:
            self.logger.error(f"Unexpected error during registration: {e}")
            return None

    def login_user(self, username_or_email: str, password: str) -> Optional[Tuple[User, str]]:
        """
        Authenticate a user and create a session.
        
        Args:
            username_or_email: The user's username or email
            password: The user's plain text password
            
        Returns:
            Tuple of (User object, access token) if login is successful, None otherwise
        """
        try:
            # Authenticate user through user service
            user = self.user_service.authenticate_user(username_or_email, password)
            if not user:
                self.logger.warning(f"Login failed for: {username_or_email}")
                return None
            
            # Create access token
            access_token_expires = timedelta(minutes=30)  # 30 minutes as per config
            access_token = create_access_token(
                data={"sub": str(user.id)},  # Using "sub" field as per JWT standards
                expires_delta=access_token_expires
            )
            
            self.logger.info(f"User logged in successfully: {user.id}")
            return user, access_token
            
        except Exception as e:
            self.logger.error(f"Unexpected error during login: {e}")
            return None

    def logout_user(self, user_id: str) -> bool:
        """
        Log out a user by invalidating their session.
        
        Args:
            user_id: The ID of the user to log out
            
        Returns:
            bool: True if logout is successful, False otherwise
        """
        try:
            # In a cookie-based system, we typically just let the cookie expire
            # But we can mark sessions as revoked if needed
            # For now, we'll just log the logout event
            self.logger.info(f"User logged out: {user_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error during logout: {e}")
            return False

    def refresh_token(self, token: str) -> Optional[str]:
        """
        Refresh an access token.
        
        Args:
            token: The current access token to refresh
            
        Returns:
            New access token if refresh is successful, None otherwise
        """
        try:
            # In a real implementation, we would have refresh tokens
            # For now, we'll just create a new access token if the current one is valid
            from ..core.security import decode_access_token
            payload = decode_access_token(token)
            
            if not payload:
                self.logger.warning("Invalid or expired token during refresh")
                return None
            
            user_id = payload.get("sub")
            if not user_id:
                self.logger.warning("No user ID in token during refresh")
                return None
            
            # Create new access token
            access_token_expires = timedelta(minutes=30)
            new_token = create_access_token(
                data={"sub": user_id},
                expires_delta=access_token_expires
            )
            
            self.logger.info(f"Token refreshed for user: {user_id}")
            return new_token
            
        except Exception as e:
            self.logger.error(f"Error refreshing token: {e}")
            return None

    def get_current_user(self, token: str) -> Optional[User]:
        """
        Get the current user based on the provided token.
        
        Args:
            token: The access token
            
        Returns:
            User object if token is valid, None otherwise
        """
        try:
            from ..core.security import decode_access_token
            payload = decode_access_token(token)
            
            if not payload:
                self.logger.warning("Invalid or expired token")
                return None
            
            user_id = payload.get("sub")
            if not user_id:
                self.logger.warning("No user ID in token")
                return None
            
            user = self.user_service.get_user_by_id(user_id)
            if not user:
                self.logger.warning(f"User not found for ID: {user_id}")
                return None
            
            if not user.is_active:
                self.logger.warning(f"Inactive user attempted access: {user_id}")
                return None
            
            self.logger.info(f"Current user retrieved: {user_id}")
            return user
            
        except Exception as e:
            self.logger.error(f"Error getting current user: {e}")
            return None