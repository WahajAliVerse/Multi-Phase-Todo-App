from sqlalchemy.orm import Session
from typing import Optional
from ..models.user import User
from ..database.database import get_db
from fastapi import Depends, HTTPException, status

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Retrieve a user by their ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_username(self, username: str) -> Optional[User]:
        """Retrieve a user by their username."""
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Retrieve a user by their email."""
        return self.db.query(User).filter(User.email == email).first()

    def update_user(self, user_id: int, **kwargs) -> Optional[User]:
        """Update user information."""
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        # Update allowed fields
        allowed_fields = {'username', 'email', 'preferences'}
        for field, value in kwargs.items():
            if field in allowed_fields and hasattr(user, field):
                setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, user_id: int) -> bool:
        """Delete a user by ID."""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        self.db.delete(user)
        self.db.commit()
        return True

    def update_user_preferences(self, user_id: int, preferences: dict) -> Optional[User]:
        """Update user preferences."""
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        if user.preferences:
            user.preferences.update(preferences)
        else:
            user.preferences = preferences

        self.db.commit()
        self.db.refresh(user)
        return user

def get_user_service(db: Session = Depends(get_db)):
    """Dependency to get user service instance."""
    return UserService(db)