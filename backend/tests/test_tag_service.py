import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from src.models.tag import Tag
from src.services.tag_service import TagService

class TestTagService:
    """Unit tests for TagService."""

    def setup_method(self):
        """Set up test dependencies."""
        self.db = MagicMock(spec=Session)
        self.tag_data = {
            "name": "Test Tag",
            "color": "#FF0000"
        }

    def test_create_tag(self):
        """Test creating a new tag."""
        # Arrange
        tag = Tag(**self.tag_data)
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        with patch('src.services.tag_service.Tag') as mock_tag:
            mock_tag.return_value = tag
            
            # Act
            result = TagService.create_tag(
                self.db,
                self.tag_data["name"],
                self.tag_data["color"]
            )

            # Assert
            assert result == tag
            self.db.add.assert_called_once_with(tag)
            self.db.commit.assert_called_once()
            mock_tag.assert_called_once()

    def test_get_tag_by_id(self):
        """Test retrieving a tag by its ID."""
        # Arrange
        tag_id = 1
        tag = Tag(id=tag_id, **self.tag_data)
        self.db.query().filter().first.return_value = tag

        # Act
        result = TagService.get_tag_by_id(self.db, tag_id)

        # Assert
        assert result == tag
        self.db.query().filter().first.assert_called_once()

    def test_get_all_tags(self):
        """Test retrieving all tags."""
        # Arrange
        user_id = 1
        tags = [Tag(id=1, **self.tag_data), Tag(id=2, name="Another Tag")]
        self.db.query().filter().all.return_value = tags

        # Act
        result = TagService.get_all_tags(self.db, user_id)

        # Assert
        assert result == tags
        self.db.query().filter().all.assert_called_once()

    def test_update_tag(self):
        """Test updating an existing tag."""
        # Arrange
        tag_id = 1
        new_name = "Updated Tag"
        existing_tag = Tag(id=tag_id, **self.tag_data)
        self.db.query().filter().first.return_value = existing_tag

        # Act
        result = TagService.update_tag(self.db, tag_id, name=new_name)

        # Assert
        assert result == existing_tag
        assert result.name == new_name
        self.db.commit.assert_called_once()

    def test_delete_tag(self):
        """Test deleting a tag."""
        # Arrange
        tag_id = 1
        tag = Tag(id=tag_id, **self.tag_data)
        self.db.query().filter().first.return_value = tag

        # Act
        result = TagService.delete_tag(self.db, tag_id)

        # Assert
        assert result is True
        self.db.delete.assert_called_once_with(tag)
        self.db.commit.assert_called_once()

    def test_delete_tag_not_found(self):
        """Test deleting a tag that doesn't exist."""
        # Arrange
        tag_id = 999
        self.db.query().filter().first.return_value = None

        # Act
        result = TagService.delete_tag(self.db, tag_id)

        # Assert
        assert result is False

    def test_validate_tag_name_valid(self):
        """Test validating a valid tag name."""
        # Act
        result = TagService.validate_tag_name("Valid Tag Name")

        # Assert
        assert result is True

    def test_validate_tag_name_too_short(self):
        """Test validating a tag name that's too short."""
        # Act
        result = TagService.validate_tag_name("")

        # Assert
        assert result is False

    def test_validate_tag_name_too_long(self):
        """Test validating a tag name that's too long."""
        # Act
        result = TagService.validate_tag_name("a" * 51)  # 51 characters

        # Assert
        assert result is False