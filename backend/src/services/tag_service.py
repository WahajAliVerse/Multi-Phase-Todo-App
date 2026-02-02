from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.tag import Tag
from ..database.database import get_db
from fastapi import Depends

class TagService:
    def __init__(self, db: Session):
        self.db = db

    def create_tag(
        self,
        name: str,
        color: str,
        user_id: int
    ) -> Tag:
        """Create a new tag for a user."""
        # Validate color format (simple hex validation)
        if not self.is_valid_hex_color(color):
            raise ValueError("Color must be a valid hex color code (e.g., #FF0000)")
        
        # Validate name length
        if not 1 <= len(name) <= 50:
            raise ValueError("Tag name must be between 1 and 50 characters")
        
        # Check if tag already exists for this user
        existing_tag = self.db.query(Tag).filter(
            Tag.name == name,
            Tag.user_id == user_id
        ).first()
        
        if existing_tag:
            raise ValueError("Tag with this name already exists for the user")
        
        # Create the tag
        db_tag = Tag(
            name=name,
            color=color,
            user_id=user_id
        )
        
        self.db.add(db_tag)
        self.db.commit()
        self.db.refresh(db_tag)
        
        return db_tag

    def get_tags_by_user(self, user_id: int) -> List[Tag]:
        """Retrieve all tags for a user."""
        return self.db.query(Tag).filter(Tag.user_id == user_id).all()

    def get_tag_by_id(self, tag_id: int, user_id: int) -> Optional[Tag]:
        """Retrieve a specific tag by ID for a user."""
        return self.db.query(Tag).filter(
            Tag.id == tag_id,
            Tag.user_id == user_id
        ).first()

    def update_tag(
        self,
        tag_id: int,
        user_id: int,
        name: str = None,
        color: str = None
    ) -> Optional[Tag]:
        """Update an existing tag."""
        tag = self.get_tag_by_id(tag_id, user_id)
        if not tag:
            return None
        
        # Update fields if provided
        if name is not None:
            if not 1 <= len(name) <= 50:
                raise ValueError("Tag name must be between 1 and 50 characters")
            tag.name = name
        
        if color is not None:
            if not self.is_valid_hex_color(color):
                raise ValueError("Color must be a valid hex color code (e.g., #FF0000)")
            tag.color = color
        
        self.db.commit()
        self.db.refresh(tag)
        return tag

    def delete_tag(self, tag_id: int, user_id: int) -> bool:
        """Delete a tag by ID for a user."""
        tag = self.get_tag_by_id(tag_id, user_id)
        if not tag:
            return False
        
        self.db.delete(tag)
        self.db.commit()
        return True

    def is_valid_hex_color(self, color: str) -> bool:
        """Validate if a string is a valid hex color code."""
        if not color.startswith('#'):
            return False
        hex_part = color[1:]
        if len(hex_part) not in [3, 6]:
            return False
        try:
            int(hex_part, 16)
            return True
        except ValueError:
            return False

def get_tag_service(db: Session = Depends(get_db)):
    """Dependency to get tag service instance."""
    return TagService(db)