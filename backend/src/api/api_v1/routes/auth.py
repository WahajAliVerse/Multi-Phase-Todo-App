from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from database.session import get_db
from core.security import create_access_token, create_refresh_token, get_password_hash
from core.config import settings
from models.user import User
from schemas.user import UserSchema, UserCreateSchema as UserCreate
from schemas.task import UserLoginSchema as UserLogin
from services import auth as auth_service

router = APIRouter()

@router.post("/register", response_model=UserSchema)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = auth_service.create_user(db=db, user=user)
    return db_user

@router.post("/login")
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    result = auth_service.login_user(
        db, user_credentials.username, user_credentials.password
    )
    return result