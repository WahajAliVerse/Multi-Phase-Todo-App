from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.tag import Tag
from ..schemas.tag import TagCreate, TagUpdate


class TagService:
    """
    Service class for tag operations.
    """

    @staticmethod
    def create_tag(
        db: Session,
        name: str,
        color: str,
        user_id: int
    ) -> Tag:
        """
        Create a new tag.
        """
        db_tag = Tag(
            name=name,
            color=color,
            user_id=user_id
        )

        db.add(db_tag)
        db.commit()
        db.refresh(db_tag)
        return db_tag

    @staticmethod
    def get_tag_by_id(db: Session, tag_id: int) -> Optional[Tag]:
        """
        Get a tag by ID.
        """
        return db.query(Tag).filter(Tag.id == tag_id).first()

    @staticmethod
    def get_tags_for_user(db: Session, user_id: int) -> List[Tag]:
        """
        Get all tags for a user.
        """
        return db.query(Tag).filter(Tag.user_id == user_id).all()

    @staticmethod
    def update_tag(
        db: Session,
        tag_id: int,
        name: Optional[str] = None,
        color: Optional[str] = None
    ) -> Optional[Tag]:
        """
        Update a tag.
        """
        db_tag = TagService.get_tag_by_id(db, tag_id)
        if not db_tag:
            return None

        if name is not None:
            db_tag.name = name
        if color is not None:
            db_tag.color = color

        db.commit()
        db.refresh(db_tag)
        return db_tag

    @staticmethod
    def delete_tag(db: Session, tag_id: int) -> bool:
        """
        Delete a tag.
        """
        db_tag = TagService.get_tag_by_id(db, tag_id)
        if not db_tag:
            return False

        db.delete(db_tag)
        db.commit()
        return True