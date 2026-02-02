from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..models.user import User
from ..database.database import get_db
from ..services.user_service import UserService, get_user_service
from ..services.auth_service import AuthService, get_auth_service

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me")
async def get_current_user(
    current_user: User = Depends(AuthService.get_current_user)
):
    """Get information about the current authenticated user."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "preferences": current_user.preferences
    }


@router.put("/me")
async def update_current_user(
    username: str = None,
    email: str = None,
    preferences: Dict = None,
    current_user: User = Depends(AuthService.get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """Update information for the current authenticated user."""
    update_data = {}
    if username is not None:
        update_data["username"] = username
    if email is not None:
        update_data["email"] = email
    if preferences is not None:
        update_data["preferences"] = preferences

    updated_user = user_service.update_user(current_user.id, **update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update user"
        )

    return {
        "id": updated_user.id,
        "username": updated_user.username,
        "email": updated_user.email,
        "is_active": updated_user.is_active,
        "created_at": updated_user.created_at,
        "updated_at": updated_user.updated_at,
        "preferences": updated_user.preferences
    }