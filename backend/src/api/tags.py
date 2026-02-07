import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional
from backend.src.core.database import get_session
from backend.src.core.auth import get_current_active_user
from backend.src.core.rate_limiter import rate_limit_api
from backend.src.models.user import User
from backend.src.models.tag import Tag, TagCreate, TagUpdate
from backend.src.services.tag_service import TagService


router = APIRouter(prefix="/tags", tags=["tags"])


@router.post("/", response_model=Tag)
@rate_limit_api
def create_tag(
    tag: TagCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Create a new tag for the current user
    """
    # Ensure the tag is created for the current user
    tag_with_user = TagCreate(
        name=tag.name,
        color=tag.color,
        user_id=current_user.id
    )
    
    tag_service = TagService()
    db_tag = tag_service.create_tag(session, tag_with_user)
    return db_tag


@router.get("/{tag_id}", response_model=Tag)
@rate_limit_api
def read_tag(
    tag_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific tag by ID
    """
    tag_service = TagService()
    tag = tag_service.get_tag_by_id(session, tag_id, current_user.id)
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    return tag


@router.get("/", response_model=List[Tag])
@rate_limit_api
def read_tags(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=1000)
):
    """
    Get all tags for the current user with pagination
    """
    tag_service = TagService()
    tags = tag_service.get_tags_by_user(
        session=session,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return tags


@router.put("/{tag_id}", response_model=Tag)
@rate_limit_api
def update_tag(
    tag_id: uuid.UUID,
    tag_update: TagUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Update a specific tag by ID
    """
    tag_service = TagService()
    updated_tag = tag_service.update_tag(
        session=session,
        tag_id=tag_id,
        user_id=current_user.id,
        tag_update=tag_update
    )
    
    if not updated_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    return updated_tag


@router.delete("/{tag_id}")
@rate_limit_api
def delete_tag(
    tag_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Delete a specific tag by ID
    """
    tag_service = TagService()
    success = tag_service.delete_tag(
        session=session,
        tag_id=tag_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    return {"message": "Tag deleted successfully"}