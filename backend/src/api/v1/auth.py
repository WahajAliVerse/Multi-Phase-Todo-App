from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import timedelta
from typing import Optional

from src.database.database import get_db
from src.models.user import User
from src.core.security import verify_password, get_password_hash, create_access_token
from src.api.deps import create_response, create_error_response
from src.middleware.auth import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

security = HTTPBearer()

@router.post("/register", response_model=dict)
def register_user(
    username: str,
    email: str, 
    password: str,
    db: Session = Depends(get_db)
):
    """Register a new user."""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=409,
                detail=create_error_response(
                    message="Username or email already registered",
                    error_code="CONFLICT",
                    status_code=409
                )
            )
        
        # Create new user
        user = User(username=username, email=email)
        user.set_password(password)  # Using the set_password method from the User model
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Remove password from response
        user_response = user.__dict__.copy()
        del user_response['hashed_password']
        
        return create_response(
            data=user_response, 
            message="User registered successfully", 
            status_code=201
        )
    except HTTPException:
        raise
    except Exception as e:
        return create_error_response(
            message=f"Error registering user: {str(e)}",
            error_code="INTERNAL_ERROR",
            status_code=500
        )


@router.post("/login", response_model=dict)
def login_user(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    """Authenticate user and return JWT tokens."""
    try:
        # Find user by username
        user = db.query(User).filter(User.username == username).first()
        
        if not user or not user.verify_password(password):
            raise HTTPException(
                status_code=401,
                detail=create_error_response(
                    message="Incorrect username or password",
                    error_code="UNAUTHORIZED",
                    status_code=401
                )
            )
        
        # Update last login time
        user.last_login = func.now()  # type: ignore
        db.commit()
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, 
            expires_delta=access_token_expires
        )
        
        # In a real app, you would also create a refresh token
        # For now, we'll just return the access token
        
        return create_response(
            data={
                "access_token": access_token,
                "token_type": "bearer"
            },
            message="Login successful"
        )
    except HTTPException:
        raise
    except Exception as e:
        return create_error_response(
            message=f"Error during login: {str(e)}",
            error_code="INTERNAL_ERROR",
            status_code=500
        )