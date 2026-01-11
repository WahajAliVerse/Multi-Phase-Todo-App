import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from src.models.task import Task, TaskStatus, TaskPriority
from src.services.task_service import TaskService

class TestTaskServiceSearchFilterSort:
    """Unit tests for search, filter, and sort functionality in TaskService."""

    def setup_method(self):
        """Set up test dependencies."""
        self.db = MagicMock(spec=Session)
        self.now = datetime.utcnow()
        
        # Create sample tasks for testing
        self.sample_tasks = [
            Task(
                id=1,
                title="Urgent Task",
                description="This is an urgent task",
                status=TaskStatus.ACTIVE,
                priority=TaskPriority.HIGH,
                due_date=self.now + timedelta(days=1),
                created_at=self.now - timedelta(hours=1)
            ),
            Task(
                id=2,
                title="Low Priority Task",
                description="This is a low priority task",
                status=TaskStatus.ACTIVE,
                priority=TaskPriority.LOW,
                due_date=self.now + timedelta(days=7),
                created_at=self.now - timedelta(hours=2)
            ),
            Task(
                id=3,
                title="Completed Task",
                description="This task is completed",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.MEDIUM,
                due_date=self.now - timedelta(days=1),
                created_at=self.now - timedelta(hours=3)
            )
        ]

    def test_search_tasks_by_title(self):
        """Test searching tasks by title."""
        # Arrange
        search_query = "urgent"
        expected_task = self.sample_tasks[0]  # "Urgent Task"
        
        # Mock the query to return sample tasks
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [expected_task]
        self.db.query.return_value = mock_query

        # Act
        result = TaskService.search_tasks(self.db, search_query, skip=0, limit=10)

        # Assert
        assert len(result) == 1
        assert result[0].id == expected_task.id
        assert search_query.lower() in result[0].title.lower()

    def test_search_tasks_by_description(self):
        """Test searching tasks by description."""
        # Arrange
        search_query = "completed"
        expected_task = self.sample_tasks[2]  # "Completed Task"
        
        # Mock the query to return sample tasks
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [expected_task]
        self.db.query.return_value = mock_query

        # Act
        result = TaskService.search_tasks(self.db, search_query, skip=0, limit=10)

        # Assert
        assert len(result) == 1
        assert result[0].id == expected_task.id
        assert search_query.lower() in result[0].description.lower()

    def test_filter_tasks_by_status(self):
        """Test filtering tasks by status."""
        # Arrange
        status = "completed"
        expected_task = self.sample_tasks[2]  # "Completed Task"
        
        # Mock the query to return sample tasks
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [expected_task]
        self.db.query.return_value = mock_query

        # Act
        result = TaskService.filter_tasks(self.db, status=status, skip=0, limit=10)

        # Assert
        assert len(result) == 1
        assert result[0].id == expected_task.id
        assert result[0].status.value == status

    def test_filter_tasks_by_priority(self):
        """Test filtering tasks by priority."""
        # Arrange
        priority = "high"
        expected_task = self.sample_tasks[0]  # "Urgent Task" with high priority
        
        # Mock the query to return sample tasks
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [expected_task]
        self.db.query.return_value = mock_query

        # Act
        result = TaskService.filter_tasks(self.db, priority=priority, skip=0, limit=10)

        # Assert
        assert len(result) == 1
        assert result[0].id == expected_task.id
        assert result[0].priority.value == priority

    def test_sort_tasks_by_due_date_asc(self):
        """Test sorting tasks by due date in ascending order."""
        # Arrange
        # Create tasks with different due dates
        tasks = [
            Task(id=1, title="Task 1", due_date=self.now + timedelta(days=3)),
            Task(id=2, title="Task 2", due_date=self.now + timedelta(days=1)),
            Task(id=3, title="Task 3", due_date=self.now + timedelta(days=2)),
        ]
        
        # Mock the query to return sorted tasks
        mock_query = MagicMock()
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = sorted(tasks, key=lambda t: t.due_date)
        self.db.query.return_value = mock_query

        # Act
        result = TaskService.sort_tasks(self.db, sort_by='due_date', sort_order='asc', skip=0, limit=10)

        # Assert
        assert len(result) == 3
        # The result should be sorted by due date in ascending order
        for i in range(len(result) - 1):
            assert result[i].due_date <= result[i + 1].due_date

    def test_sort_tasks_by_priority_desc(self):
        """Test sorting tasks by priority in descending order."""
        # Arrange
        # Create tasks with different priorities
        tasks = [
            Task(id=1, title="Task 1", priority=TaskPriority.LOW),
            Task(id=2, title="Task 2", priority=TaskPriority.HIGH),
            Task(id=3, title="Task 3", priority=TaskPriority.MEDIUM),
        ]
        
        # Mock the query to return sorted tasks
        mock_query = MagicMock()
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = sorted(tasks, key=lambda t: t.priority, reverse=True)
        self.db.query.return_value = mock_query

        # Act
        result = TaskService.sort_tasks(self.db, sort_by='priority', sort_order='desc', skip=0, limit=10)

        # Assert
        assert len(result) == 3
        # The result should be sorted by priority in descending order (HIGH, MEDIUM, LOW)
        assert result[0].priority == TaskPriority.HIGH
        assert result[-1].priority == TaskPriority.LOW

    def test_sort_tasks_by_alphabetical_asc(self):
        """Test sorting tasks alphabetically in ascending order."""
        # Arrange
        # Create tasks with titles that can be sorted alphabetically
        tasks = [
            Task(id=1, title="Zebra Task"),
            Task(id=2, title="Apple Task"),
            Task(id=3, title="Mango Task"),
        ]
        
        # Mock the query to return sorted tasks
        mock_query = MagicMock()
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = sorted(tasks, key=lambda t: t.title)
        self.db.query.return_value = mock_query

        # Act
        result = TaskService.sort_tasks(self.db, sort_by='alphabetical', sort_order='asc', skip=0, limit=10)

        # Assert
        assert len(result) == 3
        # The result should be sorted alphabetically in ascending order
        assert result[0].title == "Apple Task"
        assert result[-1].title == "Zebra Task"