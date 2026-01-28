from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....database.session import get_db
from ....api.deps import get_current_user
from ....schemas.user import User


router = APIRouter()


@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user's profile.
    """
    return current_user