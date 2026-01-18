"""
Tag service for the todo application.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.tag import Tag
from ..models.user import User


def create_tag(
    db: Session,
    name: str,
    user_id: int,
    color: Optional[str] = "#007bff"
) -> Tag:
    """
    Create a new tag.
    """
    db_tag = Tag(
        name=name,
        user_id=user_id,
        color=color
    )
    
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def get_tag(db: Session, tag_id: int) -> Optional[Tag]:
    """
    Get a tag by ID.
    """
    return db.query(Tag).filter(Tag.id == tag_id).first()


def get_tags_for_user(db: Session, user_id: int) -> List[Tag]:
    """
    Get all tags for a user.
    """
    return db.query(Tag).filter(Tag.user_id == user_id).all()


def update_tag(
    db: Session,
    tag_id: int,
    name: Optional[str] = None,
    color: Optional[str] = None
) -> Optional[Tag]:
    """
    Update a tag.
    """
    db_tag = get_tag(db, tag_id)
    if not db_tag:
        return None
    
    if name:
        db_tag.name = name
    if color:
        db_tag.color = color
    
    db.commit()
    db.refresh(db_tag)
    return db_tag


def delete_tag(db: Session, tag_id: int) -> bool:
    """
    Delete a tag.
    """
    db_tag = get_tag(db, tag_id)
    if not db_tag:
        return False
    
    db.delete(db_tag)
    db.commit()
    return True