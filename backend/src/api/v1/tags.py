from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.task import Tag
from ..services.tag_service import TagService
from ..api.deps import get_current_user
from ..core.exceptions import TagNotFoundException

router = APIRouter(prefix="/tags", tags=["Tags"])

@router.get("/", response_model=list[Tag])
def get_tags(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Retrieve all tags for the current user
    """
    return TagService.get_tags(db=db, user_id=current_user.id)

@router.post("/", response_model=Tag)
def create_tag(
    tag_data: dict,  # Using dict temporarily until we define Pydantic models
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new tag for the current user
    """
    try:
        return TagService.create_tag(
            db=db,
            name=tag_data.get("name"),
            color=tag_data.get("color"),
            user_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )

@router.put("/{tag_id}", response_model=Tag)
def update_tag(
    tag_id: str,
    tag_data: dict,  # Using dict temporarily until we define Pydantic models
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update a specific tag by ID
    """
    try:
        return TagService.update_tag(
            db=db,
            tag_id=tag_id,
            user_id=current_user.id,
            name=tag_data.get("name"),
            color=tag_data.get("color")
        )
    except TagNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with id {tag_id} not found"
        )

@router.delete("/{tag_id}")
def delete_tag(
    tag_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete a specific tag by ID
    """
    try:
        success = TagService.delete_tag(
            db=db,
            tag_id=tag_id,
            user_id=current_user.id
        )
        if success:
            return {"message": "Tag deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete tag"
            )
    except TagNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with id {tag_id} not found"
        )