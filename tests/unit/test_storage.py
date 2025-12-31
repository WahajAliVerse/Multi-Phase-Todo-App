import pytest
from storage.in_memory_storage import InMemoryStorage
from exceptions import InvalidTaskError


class TestAddTask:
    """Unit tests for the add_task functionality."""
    
    def test_add_task_success(self):
        """Test adding a task successfully."""
        storage = InMemoryStorage()
        
        task = storage.add_task("Test Title", "Test Description")
        
        assert task.id == 1
        assert task.title == "Test Title"
        assert task.description == "Test Description"
        assert task.completed is False
        assert len(storage.tasks) == 1
    
    def test_add_task_default_description(self):
        """Test adding a task with default empty description."""
        storage = InMemoryStorage()
        
        task = storage.add_task("Test Title")
        
        assert task.id == 1
        assert task.title == "Test Title"
        assert task.description == ""
        assert task.completed is False
    
    def test_add_multiple_tasks(self):
        """Test adding multiple tasks with auto-incrementing IDs."""
        storage = InMemoryStorage()
        
        task1 = storage.add_task("Task 1")
        task2 = storage.add_task("Task 2")
        task3 = storage.add_task("Task 3")
        
        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3
        assert len(storage.tasks) == 3
    
    def test_add_task_invalid_title_empty(self):
        """Test adding a task with an empty title."""
        storage = InMemoryStorage()
        
        with pytest.raises(InvalidTaskError):
            storage.add_task("")
    
    def test_add_task_invalid_title_too_short(self):
        """Test adding a task with a title that's too short."""
        storage = InMemoryStorage()
        
        with pytest.raises(InvalidTaskError):
            storage.add_task("")  # Empty string
    
    def test_add_task_invalid_title_too_long(self):
        """Test adding a task with a title that's too long."""
        storage = InMemoryStorage()
        long_title = "A" * 256  # 256 characters, exceeding the 255 limit
        
        with pytest.raises(InvalidTaskError):
            storage.add_task(long_title)
    
    def test_add_task_invalid_description_too_long(self):
        """Test adding a task with a description that's too long."""
        storage = InMemoryStorage()
        long_description = "A" * 1001  # 1001 characters, exceeding the 1000 limit
        
        with pytest.raises(InvalidTaskError):
            storage.add_task("Valid Title", long_description)