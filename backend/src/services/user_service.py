"""
User service for CRUD operations.

This module implements the User service with all required CRUD operations
as specified in the requirements.
"""

from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..models.user import User
from ..auth.hash import get_password_hash, verify_password
from ..utils.responses import create_error_response
import logging


class UserService:
    """
    Service class for managing User operations.
    """
    
    def __init__(self, db_session: Session):
        """
        Initialize the User service with a database session.
        
        Args:
            db_session: SQLAlchemy database session
        """
        self.db = db_session
        self.logger = logging.getLogger(__name__)

    def create_user(self, username: str, email: str, password: str) -> Optional[User]:
        """
        Create a new user with the provided details.
        
        Args:
            username: The user's username
            email: The user's email address
            password: The user's plain text password
            
        Returns:
            User object if created successfully, None otherwise
        """
        try:
            # Validate input
            if not User.validate_username(username):
                self.logger.error(f"Invalid username: {username}")
                return None
                
            if not User.validate_email(email):
                self.logger.error(f"Invalid email: {email}")
                return None
            
            # Check if user already exists
            existing_user = self.get_user_by_username(username)
            if existing_user:
                self.logger.error(f"Username already exists: {username}")
                return None
                
            existing_email = self.get_user_by_email(email)
            if existing_email:
                self.logger.error(f"Email already exists: {email}")
                return None
            
            # Create new user
            hashed_password = get_password_hash(password)
            user = User(
                username=username,
                email=email,
                hashed_password=hashed_password
            )
            
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            
            self.logger.info(f"User created successfully: {user.id}")
            return user
            
        except IntegrityError as e:
            self.db.rollback()
            self.logger.error(f"Integrity error creating user: {e}")
            return None
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Unexpected error creating user: {e}")
            return None

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        Retrieve a user by their ID.
        
        Args:
            user_id: The ID of the user to retrieve
            
        Returns:
            User object if found, None otherwise
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            return user
        except Exception as e:
            self.logger.error(f"Error retrieving user by ID: {e}")
            return None

    def get_user_by_username(self, username: str) -> Optional[User]:
        """
        Retrieve a user by their username.
        
        Args:
            username: The username of the user to retrieve
            
        Returns:
            User object if found, None otherwise
        """
        try:
            user = self.db.query(User).filter(User.username == username).first()
            return user
        except Exception as e:
            self.logger.error(f"Error retrieving user by username: {e}")
            return None

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Retrieve a user by their email.
        
        Args:
            email: The email of the user to retrieve
            
        Returns:
            User object if found, None otherwise
        """
        try:
            user = self.db.query(User).filter(User.email == email).first()
            return user
        except Exception as e:
            self.logger.error(f"Error retrieving user by email: {e}")
            return None

    def update_user(self, user_id: str, **kwargs) -> Optional[User]:
        """
        Update a user's information.
        
        Args:
            user_id: The ID of the user to update
            **kwargs: Fields to update (username, email, password, etc.)
            
        Returns:
            Updated User object if successful, None otherwise
        """
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                self.logger.error(f"User not found for update: {user_id}")
                return None
            
            # Handle password update separately
            if 'password' in kwargs:
                user.set_password(kwargs.pop('password'))
            
            # Update other fields
            for field, value in kwargs.items():
                if hasattr(user, field):
                    if field == 'username' and not User.validate_username(value):
                        self.logger.error(f"Invalid username: {value}")
                        return None
                    elif field == 'email' and not User.validate_email(value):
                        self.logger.error(f"Invalid email: {value}")
                        return None
                    setattr(user, field, value)
            
            self.db.commit()
            self.db.refresh(user)
            
            self.logger.info(f"User updated successfully: {user_id}")
            return user
            
        except IntegrityError as e:
            self.db.rollback()
            self.logger.error(f"Integrity error updating user: {e}")
            return None
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Unexpected error updating user: {e}")
            return None

    def delete_user(self, user_id: str) -> bool:
        """
        Delete a user.
        
        Args:
            user_id: The ID of the user to delete
            
        Returns:
            bool: True if deletion was successful, False otherwise
        """
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                self.logger.error(f"User not found for deletion: {user_id}")
                return False
            
            self.db.delete(user)
            self.db.commit()
            
            self.logger.info(f"User deleted successfully: {user_id}")
            return True
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Error deleting user: {e}")
            return False

    def authenticate_user(self, username_or_email: str, password: str) -> Optional[User]:
        """
        Authenticate a user with their username/email and password.
        
        Args:
            username_or_email: The user's username or email
            password: The user's plain text password
            
        Returns:
            User object if authentication is successful, None otherwise
        """
        try:
            # Try to find user by username first, then by email
            user = self.get_user_by_username(username_or_email)
            if not user:
                user = self.get_user_by_email(username_or_email)
                
            if not user or not user.verify_password(password):
                self.logger.warning(f"Authentication failed for: {username_or_email}")
                return None
            
            if not user.is_active:
                self.logger.warning(f"Inactive user attempted login: {user.id}")
                return None
            
            self.logger.info(f"User authenticated successfully: {user.id}")
            return user
            
        except Exception as e:
            self.logger.error(f"Error during authentication: {e}")
            return None

    def list_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """
        List users with pagination.
        
        Args:
            skip: Number of users to skip
            limit: Maximum number of users to return
            
        Returns:
            List of User objects
        """
        try:
            users = self.db.query(User).offset(skip).limit(limit).all()
            return users
        except Exception as e:
            self.logger.error(f"Error listing users: {e}")
            return []