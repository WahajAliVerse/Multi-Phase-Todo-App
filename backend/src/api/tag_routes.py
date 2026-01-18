"""
Tag API routes for the todo application.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from src.database.session import get_db
from src.auth.dependencies import get_current_user
from src.schemas.tag import TagSchema, TagCreateSchema, TagUpdateSchema
from src.models.user import User
from src.services.tag_service import (
    create_tag, get_tag, get_tags_for_user, update_tag, delete_tag
)

router = APIRouter()


@router.get("/", response_model=List[TagSchema])
def read_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tags for the current user.
    """
    tags = get_tags_for_user(db, current_user.id)
    return tags


@router.post("/", response_model=TagSchema)
def create_new_tag(
    tag_data: TagCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new tag.
    """
    tag = create_tag(
        db=db,
        name=tag_data.name,
        user_id=current_user.id,
        color=tag_data.color
    )
    return tag


@router.put("/{tag_id}", response_model=TagSchema)
def update_existing_tag(
    tag_id: int,
    tag_update: TagUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing tag.
    """
    tag = update_tag(
        db=db,
        tag_id=tag_id,
        name=tag_update.name,
        color=tag_update.color
    )

    if not tag or tag.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Tag not found")

    return tag


@router.delete("/{tag_id}")
def delete_existing_tag(tag_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Delete a tag.
    """
    tag = get_tag(db, tag_id)
    if not tag or tag.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Tag not found")

    success = delete_tag(db, tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")

    return {"message": "Tag deleted successfully"}