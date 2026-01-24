from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.tag import Tag
from schemas.tag import TagCreateSchema as TagCreate, TagUpdateSchema as TagUpdate


def get_tag(db: Session, tag_id: int):
    return db.query(Tag).filter(Tag.id == tag_id).first()


def get_tags(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    query = db.query(Tag).filter(Tag.user_id == user_id)
    tags = query.offset(skip).limit(limit).all()
    
    # Get total count for pagination
    total = query.count()
    
    return tags, total


def create_tag(db: Session, tag: TagCreate, user_id: int):
    # Check if tag already exists for this user
    existing_tag = db.query(Tag).filter(
        and_(Tag.name == tag.name, Tag.user_id == user_id)
    ).first()
    
    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag name already exists for user"
        )
    
    db_tag = Tag(name=tag.name, color=tag.color, user_id=user_id)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def update_tag(db: Session, tag_id: int, tag_update: TagUpdate, user_id: int):
    db_tag = get_tag(db, tag_id)
    if not db_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Check if user owns the tag
    if db_tag.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this tag"
        )
    
    # Check if new name already exists for this user
    if tag_update.name:
        existing_tag = db.query(Tag).filter(
            and_(Tag.name == tag_update.name, Tag.user_id == user_id)
        ).first()
        
        if existing_tag and existing_tag.id != tag_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tag name already exists for user"
            )
    
    # Update fields if provided
    if tag_update.name is not None:
        db_tag.name = tag_update.name
    if tag_update.color is not None:
        db_tag.color = tag_update.color
    
    db.commit()
    db.refresh(db_tag)
    return db_tag


def delete_tag(db: Session, tag_id: int, user_id: int):
    db_tag = get_tag(db, tag_id)
    if not db_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Check if user owns the tag
    if db_tag.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this tag"
        )
    
    db.delete(db_tag)
    db.commit()
    return db_tag