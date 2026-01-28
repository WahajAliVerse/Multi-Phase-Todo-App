from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ....database.session import get_db
from ....api.deps import get_current_user
from ....schemas.tag import Tag, TagCreate, TagUpdate
from ....models.user import User
from ....models.tag import Tag as TagModel
from ....services.tag_service import TagService


router = APIRouter()


@router.get("/", response_model=List[Tag])
def read_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tags for the current user.
    """
    tags = TagService.get_tags_for_user(db, current_user.id)
    return tags


@router.post("/", response_model=Tag)
def create_tag(tag: TagCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Create a new tag.
    """
    return TagService.create_tag(
        db=db,
        name=tag.name,
        color=tag.color,
        user_id=current_user.id
    )


@router.get("/{tag_id}", response_model=Tag)
def read_tag(tag_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get a specific tag by ID.
    """
    tag = TagService.get_tag_by_id(db, tag_id)
    if not tag or tag.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.put("/{tag_id}", response_model=Tag)
def update_tag(tag_id: int, tag_update: TagUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update a specific tag by ID.
    """
    tag = TagService.update_tag(
        db=db,
        tag_id=tag_id,
        name=tag_update.name,
        color=tag_update.color
    )
    if not tag or tag.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.delete("/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Delete a specific tag by ID.
    """
    tag = TagService.get_tag_by_id(db, tag_id)
    if not tag or tag.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    success = TagService.delete_tag(db, tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {"message": "Tag deleted successfully"}