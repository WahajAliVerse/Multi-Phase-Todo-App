import pytest
from storage.in_memory_storage import InMemoryStorage
from exceptions import TaskNotFoundError, InvalidTaskError


class TestMarkTask:
    """Unit tests for mark_task_complete and mark_task_incomplete functionality."""
    
    def test_mark_task_complete(self):
        """Test marking a task as complete."""
        storage = InMemoryStorage()
        task = storage.add_task("Test Task", "Test Description")
        
        result = storage.mark_task_complete(task.id)
        
        assert result is True
        assert storage.get_task(task.id).completed is True
    
    def test_mark_task_incomplete(self):
        """Test marking a task as incomplete."""
        storage = InMemoryStorage()
        task = storage.add_task("Test Task", "Test Description")
        # First mark as complete
        storage.mark_task_complete(task.id)
        
        result = storage.mark_task_incomplete(task.id)
        
        assert result is True
        assert storage.get_task(task.id).completed is False
    
    def test_mark_task_complete_invalid_id(self):
        """Test marking a task with an invalid ID."""
        storage = InMemoryStorage()
        
        with pytest.raises(InvalidTaskError):
            storage.mark_task_complete("invalid_id")
    
    def test_mark_task_incomplete_invalid_id(self):
        """Test marking a task as incomplete with an invalid ID."""
        storage = InMemoryStorage()
        
        with pytest.raises(InvalidTaskError):
            storage.mark_task_incomplete("invalid_id")
    
    def test_mark_task_complete_nonexistent_id(self):
        """Test marking a task with a non-existent ID."""
        storage = InMemoryStorage()
        
        with pytest.raises(TaskNotFoundError):
            storage.mark_task_complete(999)
    
    def test_mark_task_incomplete_nonexistent_id(self):
        """Test marking a task as incomplete with a non-existent ID."""
        storage = InMemoryStorage()
        
        with pytest.raises(TaskNotFoundError):
            storage.mark_task_incomplete(999)