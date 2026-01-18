"""
User preferences API routes for the todo application.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel
from src.database.session import get_db
from src.auth.dependencies import get_current_user
from src.models.user import User
from src.services.user_service import update_user

router = APIRouter()


class UserPreferences(BaseModel):
    theme: str = "light"
    language: str = "en"
    notifications_enabled: bool = True
    timezone: str = "UTC"


@router.get("/preferences", response_model=UserPreferences)
def read_user_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user preferences.
    """
    if current_user.preferences:
        import json
        return json.loads(current_user.preferences)
    else:
        return UserPreferences()


@router.put("/preferences", response_model=UserPreferences)
def update_user_preferences(
    preferences: UserPreferences,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user preferences.
    """
    import json
    preferences_json = preferences.dict()
    current_user.preferences = json.dumps(preferences_json)
    db.commit()
    db.refresh(current_user)

    return preferences