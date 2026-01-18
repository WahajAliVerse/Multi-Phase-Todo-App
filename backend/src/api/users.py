from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any
from ..database.session import get_db
from ..schemas.user import UserSchema, UserUpdateSchema
from ..models.user import User
from ..services.user import get_user, update_user
from ..api.deps import get_current_user, get_current_active_user


router = APIRouter()


@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current user profile
    """
    return current_user


@router.put("/me", response_model=UserSchema)
def update_user_profile(
    user_update: UserUpdateSchema,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile
    """
    try:
        updated_user = update_user(db, current_user.id, user_update)
        return updated_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )