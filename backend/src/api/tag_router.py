from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..models.tag import Tag
from ..database.database import get_db
from ..services.tag_service import TagService, get_tag_service
from ..services.auth_service import AuthService

router = APIRouter(prefix="/tags", tags=["tags"])

@router.get("/")
async def get_tags(
    current_user: dict = Depends(AuthService.get_current_user),
    tag_service: TagService = Depends(get_tag_service)
):
    """Retrieve all tags for the current user."""
    tags = tag_service.get_tags_by_user(current_user.id)
    return {"tags": tags}


@router.post("/")
async def create_tag(
    name: str,
    color: str,
    current_user: dict = Depends(AuthService.get_current_user),
    tag_service: TagService = Depends(get_tag_service)
):
    """Create a new tag for the current user."""
    try:
        tag = tag_service.create_tag(
            name=name,
            color=color,
            user_id=current_user.id
        )
        return tag
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{tag_id}")
async def get_tag(
    tag_id: int,
    current_user: dict = Depends(AuthService.get_current_user),
    tag_service: TagService = Depends(get_tag_service)
):
    """Get a specific tag by ID."""
    tag = tag_service.get_tag_by_id(tag_id, current_user.id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    return tag


@router.put("/{tag_id}")
async def update_tag(
    tag_id: int,
    name: str = None,
    color: str = None,
    current_user: dict = Depends(AuthService.get_current_user),
    tag_service: TagService = Depends(get_tag_service)
):
    """Update an existing tag."""
    try:
        updated_tag = tag_service.update_tag(
            tag_id=tag_id,
            user_id=current_user.id,
            name=name,
            color=color
        )
        
        if not updated_tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found"
            )
        
        return updated_tag
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: int,
    current_user: dict = Depends(AuthService.get_current_user),
    tag_service: TagService = Depends(get_tag_service)
):
    """Delete a tag."""
    success = tag_service.delete_tag(tag_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    return {"message": "Tag deleted successfully"}