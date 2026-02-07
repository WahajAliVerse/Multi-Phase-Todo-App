from typing import Optional
import uuid
from sqlmodel import Session
from src.models.user import User, UserCreate
from src.schemas.user import UserUpdate
from src.repositories.user_repository import UserRepository


class UserService:
    def __init__(self):
        self.repository = UserRepository()

    def create_user(self, session: Session, user_create: UserCreate) -> User:
        """
        Create a new user
        """
        return self.repository.create_user(session, user_create)

    def get_user_by_email(self, session: Session, email: str) -> Optional[User]:
        """
        Get a user by email
        """
        return self.repository.get_user_by_email(session, email)

    def get_user_by_id(self, session: Session, user_id: uuid.UUID) -> Optional[User]:
        """
        Get a user by ID
        """
        return self.repository.get_user_by_id(session, user_id)

    def update_user(self, session: Session, user_id: uuid.UUID, user_update: UserUpdate) -> Optional[User]:
        """
        Update a user's information
        """
        return self.repository.update_user(session, user_id, user_update)

    def delete_user(self, session: Session, user_id: uuid.UUID) -> bool:
        """
        Delete a user
        """
        return self.repository.delete_user(session, user_id)

    def authenticate_user(self, session: Session, email: str, password: str):
        """
        Authenticate a user
        """
        return self.repository.authenticate_user(session, email, password)

    def activate_user(self, session: Session, user_id: uuid.UUID) -> Optional[User]:
        """
        Activate a user account
        """
        user_update = UserUpdate(is_active=True)
        return self.repository.update_user(session, user_id, user_update)

    def deactivate_user(self, session: Session, user_id: uuid.UUID) -> Optional[User]:
        """
        Deactivate a user account
        """
        user_update = UserUpdate(is_active=False)
        return self.repository.update_user(session, user_id, user_update)