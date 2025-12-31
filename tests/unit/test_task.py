import pytest
from models.task import Task


class TestTaskModel:
    """Unit tests for the Task model."""
    
    def test_task_creation(self):
        """Test creating a task with valid parameters."""
        task = Task(id=1, title="Test Task", description="Test Description", completed=False)
        
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.completed is False
    
    def test_task_creation_defaults(self):
        """Test creating a task with default values."""
        task = Task(id=1, title="Test Task")
        
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == ""
        assert task.completed is False
    
    def test_mark_complete(self):
        """Test marking a task as complete."""
        task = Task(id=1, title="Test Task", completed=False)
        
        task.mark_complete()
        
        assert task.completed is True
    
    def test_mark_incomplete(self):
        """Test marking a task as incomplete."""
        task = Task(id=1, title="Test Task", completed=True)
        
        task.mark_incomplete()
        
        assert task.completed is False
    
    def test_update_details(self):
        """Test updating task details."""
        task = Task(id=1, title="Old Title", description="Old Description")
        
        task.update_details(title="New Title", description="New Description")
        
        assert task.title == "New Title"
        assert task.description == "New Description"
    
    def test_update_details_partial(self):
        """Test updating only title or description."""
        task = Task(id=1, title="Old Title", description="Old Description")
        
        # Update only title
        task.update_details(title="New Title")
        assert task.title == "New Title"
        assert task.description == "Old Description"
        
        # Update only description
        task.update_details(description="New Description")
        assert task.title == "New Title"
        assert task.description == "New Description"
    
    def test_to_dict(self):
        """Test converting task to dictionary."""
        task = Task(id=1, title="Test Task", description="Test Description", completed=True)
        task_dict = task.to_dict()
        
        expected = {
            "id": 1,
            "title": "Test Task",
            "description": "Test Description",
            "completed": True
        }
        
        assert task_dict == expected