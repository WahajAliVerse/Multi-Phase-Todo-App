import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from src.models.task import Task
from src.services.recurring_service import RecurringService

class TestRecurringService:
    """Unit tests for RecurringService."""

    def setup_method(self):
        """Set up test dependencies."""
        self.db = MagicMock(spec=Session)
        self.now = datetime.utcnow()
        
        # Sample task data
        self.task_data = {
            "title": "Recurring Task",
            "description": "This is a recurring task",
            "priority": "medium",
            "due_date": self.now + timedelta(days=1),
            "recurrence_pattern": "daily",
            "interval": 1
        }

    def test_calculate_next_occurrence_daily(self):
        """Test calculating the next occurrence for daily pattern."""
        # Arrange
        pattern_type = "daily"
        interval = 1
        last_occurrence = self.now

        # Act
        next_occurrence = RecurringService.calculate_next_occurrence(pattern_type, interval, last_occurrence)

        # Assert
        expected_date = last_occurrence + timedelta(days=interval)
        assert next_occurrence == expected_date

    def test_calculate_next_occurrence_weekly(self):
        """Test calculating the next occurrence for weekly pattern."""
        # Arrange
        pattern_type = "weekly"
        interval = 2  # Every 2 weeks
        last_occurrence = self.now

        # Act
        next_occurrence = RecurringService.calculate_next_occurrence(pattern_type, interval, last_occurrence)

        # Assert
        expected_date = last_occurrence + timedelta(weeks=interval)
        assert next_occurrence == expected_date

    def test_calculate_next_occurrence_monthly(self):
        """Test calculating the next occurrence for monthly pattern."""
        # Arrange
        pattern_type = "monthly"
        interval = 1
        last_occurrence = self.now

        # Act
        next_occurrence = RecurringService.calculate_next_occurrence(pattern_type, interval, last_occurrence)

        # Assert - For monthly, we expect the same day of the next month
        # This is a simplified test; in reality, we'd need to handle month boundaries
        assert next_occurrence.month == (last_occurrence.month % 12) + 1
        assert next_occurrence.year == last_occurrence.year if last_occurrence.month < 12 else last_occurrence.year + 1

    def test_calculate_next_occurrence_yearly(self):
        """Test calculating the next occurrence for yearly pattern."""
        # Arrange
        pattern_type = "yearly"
        interval = 1
        last_occurrence = self.now

        # Act
        next_occurrence = RecurringService.calculate_next_occurrence(pattern_type, interval, last_occurrence)

        # Assert
        expected_date = last_occurrence.replace(year=last_occurrence.year + interval)
        assert next_occurrence.year == expected_date.year

    def test_convert_to_cron_daily(self):
        """Test converting daily pattern to cron expression."""
        # Arrange
        pattern_type = "daily"
        interval = 1

        # Act
        cron_expr = RecurringService.convert_to_cron(pattern_type, interval)

        # Assert
        assert cron_expr == "0 0 * * *"

    def test_convert_to_cron_weekly(self):
        """Test converting weekly pattern to cron expression."""
        # Arrange
        pattern_type = "weekly"
        interval = 1

        # Act
        cron_expr = RecurringService.convert_to_cron(pattern_type, interval)

        # Assert
        assert cron_expr == "0 0 * * 0"

    def test_convert_to_cron_monthly(self):
        """Test converting monthly pattern to cron expression."""
        # Arrange
        pattern_type = "monthly"
        interval = 1

        # Act
        cron_expr = RecurringService.convert_to_cron(pattern_type, interval)

        # Assert
        assert cron_expr == "0 0 1 * *"

    def test_convert_to_cron_yearly(self):
        """Test converting yearly pattern to cron expression."""
        # Arrange
        pattern_type = "yearly"
        interval = 1

        # Act
        cron_expr = RecurringService.convert_to_cron(pattern_type, interval)

        # Assert
        assert cron_expr == "0 0 1 1 *"

    def test_create_recurring_task(self):
        """Test creating a recurring task."""
        # Arrange
        title = "Test Recurring Task"
        description = "Test Description"
        priority = "high"
        due_date = self.now + timedelta(days=1)
        recurrence_pattern = "daily"
        interval = 1
        
        # Mock the database operations
        mock_task = Task(
            id=1,
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            recurrence_pattern=recurrence_pattern,
            next_occurrence=RecurringService.calculate_next_occurrence(
                recurrence_pattern, interval, due_date
            )
        )
        
        self.db.add.return_value = None
        self.db.flush.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        with patch('src.services.recurring_service.RecurrencePattern') as mock_recurrence_pattern:
            with patch('src.services.recurring_service.RecurringService.schedule_recurring_task') as mock_schedule:
                mock_recurrence_pattern.return_value = MagicMock()
                
                # Act
                result = RecurringService.create_recurring_task(
                    self.db,
                    title,
                    description,
                    priority,
                    due_date,
                    recurrence_pattern,
                    interval
                )

                # Assert
                assert result.title == title
                assert result.description == description
                assert result.priority == priority
                self.db.add.assert_called()
                self.db.commit.assert_called()
                mock_schedule.assert_called_once()