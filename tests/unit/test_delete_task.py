import pytest
from storage.in_memory_storage import InMemoryStorage
from exceptions import TaskNotFoundError, InvalidTaskError


class TestDeleteTask:
    """Unit tests for the delete_task functionality."""
    
    def test_delete_task_success(self):
        """Test deleting a task successfully."""
        storage = InMemoryStorage()
        task = storage.add_task("Test Task", "Description")
        
        result = storage.delete_task(task.id)
        
        assert result is True
        assert len(storage.tasks) == 0
        
        with pytest.raises(TaskNotFoundError):
            storage.get_task(task.id)
    
    def test_delete_task_invalid_id(self):
        """Test deleting a task with an invalid ID."""
        storage = InMemoryStorage()
        
        with pytest.raises(InvalidTaskError):
            storage.delete_task("invalid_id")
    
    def test_delete_task_nonexistent_id(self):
        """Test deleting a task with a non-existent ID."""
        storage = InMemoryStorage()
        
        with pytest.raises(TaskNotFoundError):
            storage.delete_task(999)
    
    def test_delete_task_multiple_tasks(self):
        """Test deleting one task from multiple tasks."""
        storage = InMemoryStorage()
        task1 = storage.add_task("Task 1", "Description 1")
        task2 = storage.add_task("Task 2", "Description 2")
        task3 = storage.add_task("Task 3", "Description 3")
        
        result = storage.delete_task(task2.id)
        
        assert result is True
        assert len(storage.tasks) == 2
        assert task1.id in storage.tasks
        assert task2.id not in storage.tasks
        assert task3.id in storage.tasks
        
        # Verify other tasks still exist
        assert storage.get_task(task1.id).title == "Task 1"
        assert storage.get_task(task3.id).title == "Task 3"