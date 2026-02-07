from typing import Optional, List
import uuid
from sqlmodel import Session
from src.models.tag import Tag, TagCreate, TagUpdate
from src.repositories.tag_repository import TagRepository


class TagService:
    def __init__(self):
        self.repository = TagRepository()

    def create_tag(self, session: Session, tag_create: TagCreate) -> Tag:
        """
        Create a new tag
        """
        return self.repository.create_tag(session, tag_create)

    def get_tag_by_id(self, session: Session, tag_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Tag]:
        """
        Get a tag by ID for a specific user
        """
        return self.repository.get_tag_by_id(session, tag_id, user_id)

    def get_tags_by_user(self, session: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Tag]:
        """
        Get all tags for a specific user with pagination
        """
        return self.repository.get_tags_by_user(session, user_id, skip, limit)

    def get_tag_by_name_and_user(self, session: Session, name: str, user_id: uuid.UUID) -> Optional[Tag]:
        """
        Get a tag by name for a specific user
        """
        return self.repository.get_tag_by_name_and_user(session, name, user_id)

    def update_tag(self, session: Session, tag_id: uuid.UUID, user_id: uuid.UUID, tag_update: TagUpdate) -> Optional[Tag]:
        """
        Update a tag's information
        """
        return self.repository.update_tag(session, tag_id, user_id, tag_update)

    def delete_tag(self, session: Session, tag_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """
        Delete a tag
        """
        return self.repository.delete_tag(session, tag_id, user_id)

    def get_or_create_tag(self, session: Session, name: str, user_id: uuid.UUID, color: Optional[str] = None) -> Tag:
        """
        Get a tag by name and user, or create it if it doesn't exist
        """
        return self.repository.get_or_create_tag(session, name, user_id, color)