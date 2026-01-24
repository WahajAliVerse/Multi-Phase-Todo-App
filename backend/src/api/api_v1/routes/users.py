from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from models.user import User as UserModel
from schemas.user import UserUpdateSchema as UserUpdate, UserSchema
from database.session import get_db
from api.deps import get_current_user
from services import auth as auth_service

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    user_update: UserUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return auth_service.update_user(db=db, user_id=current_user.id, user_update=user_update)