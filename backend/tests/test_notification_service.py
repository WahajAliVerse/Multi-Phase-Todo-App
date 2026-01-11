import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from src.models.task import Task
from src.services.notification_service import NotificationService

class TestNotificationService:
    """Unit tests for NotificationService."""

    def setup_method(self):
        """Set up test dependencies."""
        self.db = MagicMock(spec=Session)
        self.now = datetime.utcnow()
        
        # Create a sample task
        self.task = Task(
            id=1,
            title="Test Task",
            description="Test Description",
            status="active",
            due_date=self.now + timedelta(days=1)
        )

    @patch('src.services.notification_service.NotificationService.send_notification')
    def test_schedule_due_date_reminders(self, mock_send_notification):
        """Test scheduling due date reminders."""
        # Arrange
        user = MagicMock()
        user.id = 123

        # Act
        result = NotificationService.schedule_due_date_reminders(self.db, self.task, user)

        # Assert
        assert result is True
        # The function should print the scheduled reminders (in our implementation)
        # In a real implementation, it would schedule actual reminders

    def test_get_upcoming_due_tasks(self):
        """Test getting tasks that are due soon."""
        # Arrange
        user_id = 123
        days_ahead = 2
        future_tasks = [
            Task(
                id=1,
                title="Future Task 1",
                status="active",
                due_date=self.now + timedelta(hours=12)
            ),
            Task(
                id=2,
                title="Future Task 2", 
                status="active",
                due_date=self.now + timedelta(days=1)
            )
        ]
        
        # Mock the database query
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = future_tasks
        self.db.query.return_value = mock_query

        # Act
        result = NotificationService.get_upcoming_due_tasks(self.db, user_id, days_ahead)

        # Assert
        assert len(result) == 2
        assert all(task.status != "completed" for task in result)
        assert all(isinstance(task, Task) for task in result)

    @patch('builtins.print')
    def test_check_and_send_due_date_reminders(self, mock_print):
        """Test checking and sending due date reminders."""
        # Arrange
        # Create tasks that are due soon
        due_soon_tasks = [
            Task(
                id=1,
                title="Due Soon Task 1",
                status="active",
                due_date=self.now + timedelta(hours=1)
            ),
            Task(
                id=2,
                title="Due Soon Task 2",
                status="active", 
                due_date=self.now + timedelta(hours=2)
            )
        ]
        
        # Mock the database query
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = due_soon_tasks
        self.db.query.return_value = mock_query

        # Act
        NotificationService.check_and_send_due_date_reminders(self.db)

        # Assert
        # The function should print reminders for each upcoming task
        assert mock_print.call_count >= 2  # At least 2 prints for the 2 tasks

    def test_validate_notification_permission(self):
        """Test validating notification permissions."""
        # Arrange
        user_id = 123
        permission_type = "email"

        # Act
        result = NotificationService.validate_notification_permission(user_id, permission_type)

        # Assert
        # In our implementation, all permissions are granted by default
        assert result is True

    @patch('builtins.print')
    def test_register_notification_endpoint(self, mock_print):
        """Test registering a notification endpoint."""
        # Arrange
        user_id = 123
        endpoint = "https://example.com/notifications"
        auth_token = "auth123"
        p256dh = "p256dh123"

        # Act
        result = NotificationService.register_notification_endpoint(user_id, endpoint, auth_token, p256dh)

        # Assert
        assert result is True
        mock_print.assert_called_once_with(f"Registered notification endpoint for user {user_id}: {endpoint}")

    @patch('builtins.print')
    def test_unregister_notification_endpoint(self, mock_print):
        """Test unregistering a notification endpoint."""
        # Arrange
        user_id = 123
        endpoint = "https://example.com/notifications"

        # Act
        result = NotificationService.unregister_notification_endpoint(user_id, endpoint)

        # Assert
        assert result is True
        mock_print.assert_called_once_with(f"Unregistered notification endpoint for user {user_id}: {endpoint}")

    @patch('builtins.print')
    @patch('asyncio.sleep', new_callable=AsyncMock)
    async def test_send_notification(self, mock_sleep, mock_print):
        """Test sending a notification."""
        # Arrange
        user_id = 123
        message = "Test notification message"
        notification_type = "reminder"

        # Act
        result = await NotificationService.send_notification(user_id, message, notification_type)

        # Assert
        assert result is True
        mock_print.assert_called_once_with(f"Notification for user {user_id}: [{notification_type}] {message}")