from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from ..database.session import get_db
from ..schemas.tag import Tag, TagCreate, TagUpdate, PaginatedTags
from ..services.tag import get_tags, get_tag, create_tag, update_tag, delete_tag
from ..api.deps import get_current_active_user


router = APIRouter()


@router.get("/", response_model=PaginatedTags)
def read_tags(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve tags for the current user
    """
    tags, total = get_tags(db, current_user.id, skip=skip, limit=limit)
    return {
        "tags": tags,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/", response_model=Tag)
def create_new_tag(
    tag: TagCreate,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new tag
    """
    return create_tag(db, tag, current_user.id)


@router.put("/{tag_id}", response_model=Tag)
def update_existing_tag(
    tag_id: int,
    tag_update: TagUpdate,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing tag
    """
    return update_tag(db, tag_id, tag_update, current_user.id)


@router.delete("/{tag_id}")
def delete_existing_tag(
    tag_id: int,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a tag
    """
    delete_tag(db, tag_id, current_user.id)
    return {"message": "Tag deleted successfully"}