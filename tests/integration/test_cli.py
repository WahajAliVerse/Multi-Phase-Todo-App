import pytest
from unittest.mock import patch, MagicMock
from storage.in_memory_storage import InMemoryStorage
from cli.console_ui import ConsoleUI


class TestCLIIntegration:
    """Integration tests for CLI functionality."""
    
    def setup_method(self):
        """Set up a fresh storage and UI for each test."""
        self.storage = InMemoryStorage()
        self.ui = ConsoleUI(self.storage)
    
    def test_add_and_view_task(self):
        """Test adding a task and then viewing it."""
        # Add a task
        self.storage.add_task("Test Task", "Test Description")
        
        # Verify it exists
        tasks = self.storage.get_all_tasks()
        assert len(tasks) == 1
        assert tasks[0].title == "Test Task"
        assert tasks[0].description == "Test Description"
        assert tasks[0].completed is False
    
    def test_add_update_and_view_task(self):
        """Test adding, updating, and viewing a task."""
        # Add a task
        task = self.storage.add_task("Old Title", "Old Description")
        
        # Update the task
        self.storage.update_task(task.id, title="New Title", description="New Description")
        
        # Verify the update
        updated_task = self.storage.get_task(task.id)
        assert updated_task.title == "New Title"
        assert updated_task.description == "New Description"
    
    def test_add_mark_complete_and_view_task(self):
        """Test adding, marking complete, and viewing a task."""
        # Add a task
        task = self.storage.add_task("Test Task", "Test Description")
        
        # Mark as complete
        self.storage.mark_task_complete(task.id)
        
        # Verify the status
        completed_task = self.storage.get_task(task.id)
        assert completed_task.completed is True
    
    def test_add_delete_and_verify_removal(self):
        """Test adding, deleting, and verifying removal."""
        # Add a task
        task = self.storage.add_task("Test Task", "Test Description")
        
        # Verify it exists
        assert len(self.storage.get_all_tasks()) == 1
        
        # Delete the task
        self.storage.delete_task(task.id)
        
        # Verify it's gone
        assert len(self.storage.get_all_tasks()) == 0
    
    @patch('builtins.input')
    def test_handle_add_task_integration(self, mock_input):
        """Test the handle_add_task method with mocked input."""
        # Mock user input
        mock_input.side_effect = ["New Task Title", "New Task Description"]
        
        # Call the method
        self.ui.handle_add_task()
        
        # Verify the task was added
        tasks = self.storage.get_all_tasks()
        assert len(tasks) == 1
        assert tasks[0].title == "New Task Title"
        assert tasks[0].description == "New Task Description"
    
    @patch('builtins.input')
    def test_handle_update_task_integration(self, mock_input):
        """Test the handle_update_task method with mocked input."""
        # Add a task first
        task = self.storage.add_task("Old Title", "Old Description")
        
        # Mock user input: task ID, new title, new description
        mock_input.side_effect = [str(task.id), "Updated Title", "Updated Description"]
        
        # Call the method
        self.ui.handle_update_task()
        
        # Verify the task was updated
        updated_task = self.storage.get_task(task.id)
        assert updated_task.title == "Updated Title"
        assert updated_task.description == "Updated Description"
    
    @patch('builtins.input')
    def test_handle_delete_task_integration(self, mock_input):
        """Test the handle_delete_task method with mocked input."""
        # Add a task first
        task = self.storage.add_task("Test Task", "Test Description")
        
        # Verify it exists
        assert len(self.storage.get_all_tasks()) == 1
        
        # Mock user input: task ID, confirmation
        mock_input.side_effect = [str(task.id), "y"]
        
        # Call the method
        self.ui.handle_delete_task()
        
        # Verify the task was deleted
        assert len(self.storage.get_all_tasks()) == 0