import pytest
from unittest.mock import Mock, patch, MagicMock
from sqlmodel import Session, select
from backend.src.models.task import Task
from backend.src.models.user import User
from backend.src.services.task_service import TaskService
from backend.src.repositories.task_repository import TaskRepository
from backend.src.schemas.task import TaskCreate, TaskUpdate


@pytest.fixture
def mock_session():
    return Mock(spec=Session)


@pytest.fixture
def task_service():
    return TaskService()


@pytest.fixture
def sample_user():
    user = User(
        id="123e4567-e89b-12d3-a456-426614174000",
        email="test@example.com",
        hashed_password="fake_hashed_password"
    )
    return user


@pytest.fixture
def sample_task_data():
    return {
        "title": "Test Task",
        "description": "Test Description",
        "status": "pending",
        "priority": "medium",
        "user_id": "123e4567-e89b-12d3-a456-426614174000"
    }


class TestTaskService:
    def test_create_task_success(self, task_service, mock_session, sample_task_data):
        """Test successful task creation"""
        # Arrange
        task_create = TaskCreate(**sample_task_data)
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        
        expected_task = Task(
            id="123e4567-e89b-12d3-a456-426614174001",
            **sample_task_data
        )
        mock_repo.create_task.return_value = expected_task
        
        # Act
        result = task_service.create_task(mock_session, task_create)
        
        # Assert
        assert result == expected_task
        mock_repo.create_task.assert_called_once_with(mock_session, task_create)

    def test_get_task_by_id_success(self, task_service, mock_session):
        """Test successful retrieval of a task by ID"""
        # Arrange
        task_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        expected_task = Task(
            id=task_id,
            title="Test Task",
            description="Test Description",
            status="pending",
            priority="medium",
            user_id=user_id
        )
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.get_task_by_id.return_value = expected_task
        
        # Act
        result = task_service.get_task_by_id(mock_session, task_id, user_id)
        
        # Assert
        assert result == expected_task
        mock_repo.get_task_by_id.assert_called_once_with(mock_session, task_id, user_id)

    def test_get_task_by_id_not_found(self, task_service, mock_session):
        """Test retrieval of non-existent task returns None"""
        # Arrange
        task_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.get_task_by_id.return_value = None
        
        # Act
        result = task_service.get_task_by_id(mock_session, task_id, user_id)
        
        # Assert
        assert result is None
        mock_repo.get_task_by_id.assert_called_once_with(mock_session, task_id, user_id)

    def test_get_tasks_by_user_success(self, task_service, mock_session):
        """Test successful retrieval of tasks for a user"""
        # Arrange
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        expected_tasks = [
            Task(
                id="123e4567-e89b-12d3-a456-426614174001",
                title="Task 1",
                description="Description 1",
                status="pending",
                priority="medium",
                user_id=user_id
            ),
            Task(
                id="123e4567-e89b-12d3-a456-426614174002",
                title="Task 2",
                description="Description 2",
                status="in_progress",
                priority="high",
                user_id=user_id
            )
        ]
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.get_tasks_by_user.return_value = expected_tasks
        
        # Act
        result = task_service.get_tasks_by_user(mock_session, user_id)
        
        # Assert
        assert result == expected_tasks
        mock_repo.get_tasks_by_user.assert_called_once_with(
            mock_session, user_id, 0, 100, None, None, None, None, "asc", None, None
        )

    def test_update_task_success(self, task_service, mock_session):
        """Test successful task update"""
        # Arrange
        task_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        task_update_data = {
            "title": "Updated Task",
            "status": "completed"
        }
        task_update = TaskUpdate(**task_update_data)
        
        updated_task = Task(
            id=task_id,
            title="Updated Task",
            description="Test Description",
            status="completed",
            priority="medium",
            user_id=user_id
        )
        
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.update_task.return_value = updated_task
        
        # Act
        result = task_service.update_task(mock_session, task_id, user_id, task_update)
        
        # Assert
        assert result == updated_task
        mock_repo.update_task.assert_called_once_with(
            mock_session, task_id, user_id, task_update
        )

    def test_update_task_not_found(self, task_service, mock_session):
        """Test updating non-existent task returns None"""
        # Arrange
        task_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        task_update_data = {"title": "Updated Task"}
        task_update = TaskUpdate(**task_update_data)
        
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.update_task.return_value = None
        
        # Act
        result = task_service.update_task(mock_session, task_id, user_id, task_update)
        
        # Assert
        assert result is None
        mock_repo.update_task.assert_called_once_with(
            mock_session, task_id, user_id, task_update
        )

    def test_delete_task_success(self, task_service, mock_session):
        """Test successful task deletion"""
        # Arrange
        task_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.delete_task.return_value = True
        
        # Act
        result = task_service.delete_task(mock_session, task_id, user_id)
        
        # Assert
        assert result is True
        mock_repo.delete_task.assert_called_once_with(mock_session, task_id, user_id)

    def test_delete_task_not_found(self, task_service, mock_session):
        """Test deleting non-existent task returns False"""
        # Arrange
        task_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.delete_task.return_value = False
        
        # Act
        result = task_service.delete_task(mock_session, task_id, user_id)
        
        # Assert
        assert result is False
        mock_repo.delete_task.assert_called_once_with(mock_session, task_id, user_id)

    def test_mark_task_completed_success(self, task_service, mock_session):
        """Test successfully marking a task as completed"""
        # Arrange
        task_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        
        completed_task = Task(
            id=task_id,
            title="Test Task",
            description="Test Description",
            status="completed",
            priority="medium",
            user_id=user_id
        )
        
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.mark_task_completed.return_value = completed_task
        
        # Act
        result = task_service.mark_task_completed(mock_session, task_id, user_id)
        
        # Assert
        assert result == completed_task
        assert result.status == "completed"
        mock_repo.mark_task_completed.assert_called_once_with(mock_session, task_id, user_id)

    def test_mark_task_completed_not_found(self, task_service, mock_session):
        """Test marking non-existent task as completed returns None"""
        # Arrange
        task_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.mark_task_completed.return_value = None
        
        # Act
        result = task_service.mark_task_completed(mock_session, task_id, user_id)
        
        # Assert
        assert result is None
        mock_repo.mark_task_completed.assert_called_once_with(mock_session, task_id, user_id)

    def test_mark_task_incomplete_success(self, task_service, mock_session):
        """Test successfully marking a task as incomplete"""
        # Arrange
        task_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        
        incomplete_task = Task(
            id=task_id,
            title="Test Task",
            description="Test Description",
            status="pending",
            priority="medium",
            user_id=user_id
        )
        
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.mark_task_incomplete.return_value = incomplete_task
        
        # Act
        result = task_service.mark_task_incomplete(mock_session, task_id, user_id)
        
        # Assert
        assert result == incomplete_task
        assert result.status == "pending"
        mock_repo.mark_task_incomplete.assert_called_once_with(mock_session, task_id, user_id)

    def test_mark_task_incomplete_not_found(self, task_service, mock_session):
        """Test marking non-existent task as incomplete returns None"""
        # Arrange
        task_id = "123e4567-e89b-12d3-a456-426614174001"
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        
        mock_repo = Mock(spec=TaskRepository)
        task_service.repository = mock_repo
        mock_repo.mark_task_incomplete.return_value = None
        
        # Act
        result = task_service.mark_task_incomplete(mock_session, task_id, user_id)
        
        # Assert
        assert result is None
        mock_repo.mark_task_incomplete.assert_called_once_with(mock_session, task_id, user_id)