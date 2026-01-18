from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from models.tag import Tag as TagModel
from models.user import User as UserModel
from schemas.tag import Tag as TagSchema, TagCreate, TagUpdate
from database.session import get_db
from api.deps import get_current_user
from services import tag as tag_service

router = APIRouter()

@router.get("/", response_model=List[TagSchema])
def read_tags(
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tags = tag_service.get_tags(db, user_id=current_user.id, skip=skip, limit=limit)
    return tags

@router.post("/", response_model=TagSchema)
def create_tag(
    tag: TagCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return tag_service.create_tag(db=db, tag=tag, user_id=current_user.id)

@router.get("/{tag_id}", response_model=TagSchema)
def read_tag(
    tag_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tag = tag_service.get_tag_by_id_and_user(db, tag_id=tag_id, user_id=current_user.id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.put("/{tag_id}", response_model=TagSchema)
def update_tag(
    tag_id: int,
    tag_update: TagUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tag = tag_service.update_tag(db=db, tag_id=tag_id, tag_update=tag_update, user_id=current_user.id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.delete("/{tag_id}")
def delete_tag(
    tag_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = tag_service.delete_tag(db=db, tag_id=tag_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {"message": "Tag deleted successfully"}