from sqlalchemy.orm import Session
from typing import List

from ..models.task import Tag, User
from ..core.exceptions import TagNotFoundException


class TagService:
    @staticmethod
    def get_tags(db: Session, user_id: str) -> List[Tag]:
        """
        Retrieve all tags for a specific user
        """
        return db.query(Tag).filter(Tag.user_id == user_id).all()

    @staticmethod
    def get_tag_by_id(db: Session, tag_id: str, user_id: str) -> Tag:
        """
        Retrieve a specific tag by ID for a user
        """
        tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == user_id).first()
        if not tag:
            raise TagNotFoundException(tag_id)
        return tag

    @staticmethod
    def create_tag(db: Session, name: str, color: str, user_id: str) -> Tag:
        """
        Create a new tag for a user
        """
        # Check if tag with this name already exists for the user
        existing_tag = db.query(Tag).filter(Tag.name == name, Tag.user_id == user_id).first()
        if existing_tag:
            raise ValueError(f"Tag with name '{name}' already exists for this user")
        
        db_tag = Tag(name=name, color=color, user_id=user_id)
        db.add(db_tag)
        db.commit()
        db.refresh(db_tag)
        return db_tag

    @staticmethod
    def update_tag(db: Session, tag_id: str, user_id: str, name: str = None, color: str = None) -> Tag:
        """
        Update a tag for a user
        """
        tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == user_id).first()
        if not tag:
            raise TagNotFoundException(tag_id)
        
        if name is not None:
            tag.name = name
        if color is not None:
            tag.color = color
        
        db.commit()
        db.refresh(tag)
        return tag

    @staticmethod
    def delete_tag(db: Session, tag_id: str, user_id: str) -> bool:
        """
        Delete a tag for a user
        """
        tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == user_id).first()
        if not tag:
            raise TagNotFoundException(tag_id)
        
        db.delete(tag)
        db.commit()
        return True