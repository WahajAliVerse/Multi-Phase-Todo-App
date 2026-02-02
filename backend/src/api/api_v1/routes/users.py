from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from ....database.session import get_db
from ....api.deps import get_current_user
from ....schemas.user import User
from ....services.user_service import UserService, get_user_service


router = APIRouter()


@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user's profile.
    """
    return current_user


@router.put("/me")
def update_current_user(
    username: str = None,
    email: str = None,
    preferences: Dict[str, Any] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service)
):
    """
    Update current user's profile.
    """
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
        "preferences": updated_user.preferences
    }