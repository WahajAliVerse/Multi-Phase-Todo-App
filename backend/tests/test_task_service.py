import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from datetime import datetime
from src.models.task import Task, TaskStatus, TaskPriority
from src.services.task_service import TaskService

class TestTaskService:
    """Unit tests for TaskService."""

    def setup_method(self):
        """Set up test dependencies."""
        self.db = MagicMock(spec=Session)
        self.task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "priority": TaskPriority.MEDIUM,
            "due_date": datetime(2023, 12, 31)
        }

    def test_create_task(self):
        """Test creating a new task."""
        # Arrange
        task = Task(**self.task_data)
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        with patch('src.services.task_service.Task') as mock_task:
            mock_task.return_value = task
            
            # Act
            result = TaskService.create_task(
                self.db,
                self.task_data["title"],
                self.task_data["description"],
                self.task_data["priority"],
                self.task_data["due_date"]
            )

            # Assert
            assert result == task
            self.db.add.assert_called_once_with(task)
            self.db.commit.assert_called_once()
            mock_task.assert_called_once()

    def test_get_task_by_id(self):
        """Test retrieving a task by its ID."""
        # Arrange
        task_id = 1
        task = Task(id=task_id, **self.task_data)
        self.db.query().filter().first.return_value = task

        # Act
        result = TaskService.get_task_by_id(self.db, task_id)

        # Assert
        assert result == task
        self.db.query().filter().first.assert_called_once()

    def test_get_tasks(self):
        """Test retrieving a list of tasks."""
        # Arrange
        tasks = [Task(id=1, **self.task_data), Task(id=2, **self.task_data)]
        self.db.query().offset().limit().all.return_value = tasks

        # Act
        result = TaskService.get_tasks(self.db)

        # Assert
        assert result == tasks
        self.db.query().offset().limit().all.assert_called_once()

    def test_update_task(self):
        """Test updating an existing task."""
        # Arrange
        task_id = 1
        updated_title = "Updated Task"
        existing_task = Task(id=task_id, **self.task_data)
        self.db.query().filter().first.return_value = existing_task

        # Act
        result = TaskService.update_task(self.db, task_id, title=updated_title)

        # Assert
        assert result == existing_task
        assert result.title == updated_title
        self.db.commit.assert_called_once()

    def test_delete_task(self):
        """Test deleting a task."""
        # Arrange
        task_id = 1
        task = Task(id=task_id, **self.task_data)
        self.db.query().filter().first.return_value = task

        # Act
        result = TaskService.delete_task(self.db, task_id)

        # Assert
        assert result is True
        self.db.delete.assert_called_once_with(task)
        self.db.commit.assert_called_once()

    def test_delete_task_not_found(self):
        """Test deleting a task that doesn't exist."""
        # Arrange
        task_id = 999
        self.db.query().filter().first.return_value = None

        # Act
        result = TaskService.delete_task(self.db, task_id)

        # Assert
        assert result is False

    def test_mark_task_completed(self):
        """Test marking a task as completed."""
        # Arrange
        task_id = 1
        task = Task(id=task_id, **self.task_data)
        self.db.query().filter().first.return_value = task

        # Act
        result = TaskService.mark_task_completed(self.db, task_id)

        # Assert
        assert result == task
        assert result.status == TaskStatus.COMPLETED
        self.db.commit.assert_called_once()

    def test_mark_task_active(self):
        """Test marking a task as active."""
        # Arrange
        task_id = 1
        task = Task(id=task_id, **self.task_data)
        task.status = TaskStatus.COMPLETED  # Start as completed
        self.db.query().filter().first.return_value = task

        # Act
        result = TaskService.mark_task_active(self.db, task_id)

        # Assert
        assert result == task
        assert result.status == TaskStatus.ACTIVE
        self.db.commit.assert_called_once()