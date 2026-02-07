from typing import Optional, List
import uuid
from sqlmodel import Session, select, and_
from src.models.tag import Tag, TagCreate, TagUpdate


class TagRepository:
    def create_tag(self, session: Session, tag_create: TagCreate) -> Tag:
        """
        Create a new tag in the database
        """
        db_tag = Tag(
            name=tag_create.name,
            color=tag_create.color,
            user_id=tag_create.user_id
        )
        session.add(db_tag)
        session.commit()
        session.refresh(db_tag)
        return db_tag

    def get_tag_by_id(self, session: Session, tag_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Tag]:
        """
        Retrieve a tag by ID for a specific user
        """
        statement = select(Tag).where(and_(Tag.id == tag_id, Tag.user_id == user_id))
        tag = session.exec(statement).first()
        return tag

    def get_tags_by_user(self, session: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Tag]:
        """
        Retrieve all tags for a specific user with pagination
        """
        statement = select(Tag).where(Tag.user_id == user_id).offset(skip).limit(limit)
        tags = session.exec(statement).all()
        return tags

    def get_tag_by_name_and_user(self, session: Session, name: str, user_id: uuid.UUID) -> Optional[Tag]:
        """
        Retrieve a tag by name for a specific user
        """
        statement = select(Tag).where(and_(Tag.name == name, Tag.user_id == user_id))
        tag = session.exec(statement).first()
        return tag

    def update_tag(self, session: Session, tag_id: uuid.UUID, user_id: uuid.UUID, tag_update: TagUpdate) -> Optional[Tag]:
        """
        Update a tag's information
        """
        statement = select(Tag).where(and_(Tag.id == tag_id, Tag.user_id == user_id))
        db_tag = session.exec(statement).first()

        if not db_tag:
            return None

        update_data = tag_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_tag, field, value)

        session.add(db_tag)
        session.commit()
        session.refresh(db_tag)
        return db_tag

    def delete_tag(self, session: Session, tag_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """
        Delete a tag by ID for a specific user
        """
        statement = select(Tag).where(and_(Tag.id == tag_id, Tag.user_id == user_id))
        db_tag = session.exec(statement).first()

        if not db_tag:
            return False

        session.delete(db_tag)
        session.commit()
        return True

    def get_or_create_tag(self, session: Session, name: str, user_id: uuid.UUID, color: Optional[str] = None) -> Tag:
        """
        Get a tag by name and user, or create it if it doesn't exist
        """
        tag = self.get_tag_by_name_and_user(session, name, user_id)
        if tag:
            return tag
        
        tag_create = TagCreate(name=name, color=color, user_id=user_id)
        return self.create_tag(session, tag_create)