from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import re

from ..models.user import User
from ..database.database import get_db
from ..utils.auth import verify_password, get_password_hash, verify_token
from ..schemas.error import ErrorResponse

security = HTTPBearer()

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authenticate a user by username and password."""
        user = self.db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    def get_current_user(self, token: str = Depends(security)) -> User:
        """Get the current user based on the provided token."""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        payload = verify_token(token.credentials)
        if payload is None:
            raise credentials_exception
        
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        user = self.db.query(User).filter(User.username == username).first()
        if user is None:
            raise credentials_exception
        
        return user

    def create_user(self, username: str, email: str, password: str) -> User:
        """Create a new user with hashed password."""
        # Validate inputs
        if not self.is_valid_email(email):
            raise ValueError("Invalid email format")
        
        if len(username) < 3 or len(username) > 30:
            raise ValueError("Username must be between 3 and 30 characters")
        
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            raise ValueError("Username or email already registered")
        
        # Create new user
        hashed_password = get_password_hash(password)
        db_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return db_user

    def is_valid_email(self, email: str) -> bool:
        """Validate email format using regex."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

def get_auth_service(db: Session = Depends(get_db)):
    """Dependency to get auth service instance."""
    return AuthService(db)