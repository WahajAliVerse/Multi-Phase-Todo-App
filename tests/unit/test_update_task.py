import pytest
from storage.in_memory_storage import InMemoryStorage
from exceptions import TaskNotFoundError, InvalidTaskError


class TestUpdateTask:
    """Unit tests for the update_task functionality."""
    
    def test_update_task_title(self):
        """Test updating a task's title."""
        storage = InMemoryStorage()
        task = storage.add_task("Old Title", "Description")
        
        result = storage.update_task(task.id, title="New Title")
        
        assert result is True
        assert storage.get_task(task.id).title == "New Title"
        assert storage.get_task(task.id).description == "Description"
    
    def test_update_task_description(self):
        """Test updating a task's description."""
        storage = InMemoryStorage()
        task = storage.add_task("Title", "Old Description")
        
        result = storage.update_task(task.id, description="New Description")
        
        assert result is True
        assert storage.get_task(task.id).title == "Title"
        assert storage.get_task(task.id).description == "New Description"
    
    def test_update_task_both_fields(self):
        """Test updating both title and description."""
        storage = InMemoryStorage()
        task = storage.add_task("Old Title", "Old Description")
        
        result = storage.update_task(task.id, title="New Title", description="New Description")
        
        assert result is True
        assert storage.get_task(task.id).title == "New Title"
        assert storage.get_task(task.id).description == "New Description"
    
    def test_update_task_partial_update(self):
        """Test updating only one field while keeping the other."""
        storage = InMemoryStorage()
        task = storage.add_task("Old Title", "Old Description")
        
        # Update only the title
        result = storage.update_task(task.id, title="New Title")
        
        assert result is True
        assert storage.get_task(task.id).title == "New Title"
        assert storage.get_task(task.id).description == "Old Description"
    
    def test_update_task_invalid_id(self):
        """Test updating a task with an invalid ID."""
        storage = InMemoryStorage()
        
        with pytest.raises(InvalidTaskError):
            storage.update_task("invalid_id", title="New Title")
    
    def test_update_task_nonexistent_id(self):
        """Test updating a task with a non-existent ID."""
        storage = InMemoryStorage()
        
        with pytest.raises(TaskNotFoundError):
            storage.update_task(999, title="New Title")
    
    def test_update_task_invalid_title(self):
        """Test updating a task with an invalid title."""
        storage = InMemoryStorage()
        task = storage.add_task("Title", "Description")
        
        with pytest.raises(InvalidTaskError):
            storage.update_task(task.id, title="")  # Empty title
    
    def test_update_task_invalid_description(self):
        """Test updating a task with an invalid description."""
        storage = InMemoryStorage()
        task = storage.add_task("Title", "Description")
        long_description = "A" * 1001  # Exceeds 1000 character limit
        
        with pytest.raises(InvalidTaskError):
            storage.update_task(task.id, description=long_description)