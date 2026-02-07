from typing import Optional
from sqlmodel import Session, select
from backend.src.models.user import User, UserCreate
from backend.src.schemas.user import UserUpdate


class UserRepository:
    def create_user(self, session: Session, user_create: UserCreate) -> User:
        """
        Create a new user in the database
        """
        from backend.src.models.user import get_password_hash
        
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            first_name=user_create.first_name,
            last_name=user_create.last_name,
            hashed_password=hashed_password,
            theme_preference=user_create.theme_preference,
            notification_settings=user_create.notification_settings
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

    def get_user_by_email(self, session: Session, email: str) -> Optional[User]:
        """
        Retrieve a user by email
        """
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        return user

    def get_user_by_id(self, session: Session, user_id: int) -> Optional[User]:
        """
        Retrieve a user by ID
        """
        statement = select(User).where(User.id == user_id)
        user = session.exec(statement).first()
        return user

    def update_user(self, session: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """
        Update a user's information
        """
        statement = select(User).where(User.id == user_id)
        db_user = session.exec(statement).first()

        if not db_user:
            return None

        user_data = user_update.dict(exclude_unset=True)
        for key, value in user_data.items():
            setattr(db_user, key, value)

        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

    def delete_user(self, session: Session, user_id: int) -> bool:
        """
        Delete a user by ID
        """
        statement = select(User).where(User.id == user_id)
        db_user = session.exec(statement).first()

        if not db_user:
            return False

        session.delete(db_user)
        session.commit()
        return True

    def authenticate_user(self, session: Session, email: str, password: str):
        """
        Authenticate a user by email and password
        """
        from backend.src.models.user import verify_password
        
        user = self.get_user_by_email(session, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user