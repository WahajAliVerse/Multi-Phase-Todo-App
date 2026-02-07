import asyncio
import uuid
from datetime import datetime, timedelta
from sqlmodel import Session
from src.models.task import Task
from src.models.notification import Notification, NotificationType
from src.services.notification_service import NotificationService
from src.services.email_service import EmailService
from src.core.config import settings


class NotificationScheduler:
    def __init__(self):
        self.notification_service = NotificationService()
        self.email_service = EmailService()

    async def schedule_task_reminders(self, session: Session):
        """
        Schedule notifications for tasks that are due soon
        This method should be called periodically (e.g., every hour) to check for upcoming due dates
        """
        # Find tasks that are due within the next 30 minutes and haven't had a reminder sent yet
        from sqlmodel import select
        from sqlalchemy import and_
        
        now = datetime.now()
        reminder_window_start = now
        reminder_window_end = now + timedelta(minutes=30)
        
        # Query for tasks that are due in the next 30 minutes and don't have a reminder sent
        statement = select(Task).where(
            and_(
                Task.due_date >= reminder_window_start,
                Task.due_date <= reminder_window_end,
                Task.reminder_sent == False  # Assuming we add a reminder_sent field to Task
            )
        )
        
        upcoming_tasks = session.exec(statement).all()
        
        for task in upcoming_tasks:
            # Create browser notification
            browser_notification_data = {
                "type": NotificationType.BROWSER,
                "title": f"Task Reminder: {task.title}",
                "message": f"Your task '{task.title}' is due soon.",
                "user_id": task.user_id,
                "task_id": task.id
            }
            
            # Send browser notification
            await self._send_browser_notification(session, browser_notification_data)
            
            # Check if user has email notifications enabled
            user = self._get_user_by_id(session, task.user_id)
            if user and user.notification_settings.get("email", False):
                # Send email notification
                await self._send_email_notification(
                    recipient_email=user.email,
                    task_title=task.title,
                    task_description=task.description,
                    due_date=task.due_date
                )
            
            # Mark task as having reminder sent
            task.reminder_sent = True
            session.add(task)
            session.commit()

    async def _send_browser_notification(self, session: Session, notification_data: dict):
        """
        Internal method to create and send a browser notification
        """
        from src.models.notification import NotificationCreate
        
        notification_create = NotificationCreate(**notification_data)
        self.notification_service.create_notification(session, notification_create)

    async def _send_email_notification(self, recipient_email: str, task_title: str, task_description: str, due_date: datetime):
        """
        Internal method to send an email notification
        """
        await self.email_service.send_task_reminder_email(
            recipient_email=recipient_email,
            task_title=task_title,
            task_description=task_description,
            due_date=due_date.isoformat() if due_date else None
        )

    def _get_user_by_id(self, session: Session, user_id: uuid.UUID):
        """
        Internal method to get a user by ID
        This would typically be implemented in a UserService
        """
        from src.models.user import User
        from sqlmodel import select
        
        statement = select(User).where(User.id == user_id)
        user = session.exec(statement).first()
        return user

    async def schedule_recurring_task_notifications(self, session: Session):
        """
        Schedule notifications for recurring tasks
        This method should be called periodically to generate new instances of recurring tasks
        """
        from src.models.task import Task
        from src.models.recurrence_pattern import RecurrencePattern
        from sqlmodel import select
        from sqlalchemy import and_
        
        # Find recurring tasks that need new instances generated
        recurring_tasks = self._get_recurring_tasks_without_instances(session)
        
        for task in recurring_tasks:
            if task.recurrence_pattern:
                # Check if a new instance should be created based on the recurrence pattern
                next_due_date = self._calculate_next_occurrence_date(
                    task.recurrence_pattern, 
                    task.created_at if not task.due_date else task.due_date
                )
                
                # If the next occurrence is due (today or in the past) and hasn't exceeded end conditions
                if next_due_date and next_due_date <= datetime.now():
                    # Check if the recurrence should end
                    occurrence_count = self._count_task_instances(session, task.id)
                    should_end = self._should_end_recurrence(
                        task.recurrence_pattern, 
                        occurrence_count, 
                        datetime.now()
                    )
                    
                    if not should_end:
                        # Create a new instance of the recurring task
                        new_task_data = {
                            "title": task.title,
                            "description": task.description,
                            "status": "pending",
                            "priority": task.priority,
                            "due_date": next_due_date,
                            "user_id": task.user_id,
                            "recurrence_pattern_id": task.recurrence_pattern_id,
                            # Copy other relevant fields
                        }
                        
                        new_task = self._create_task_instance(session, new_task_data)
                        
                        # Schedule a reminder for the new task instance if needed
                        if new_task.due_date:
                            # Schedule reminder for the new task
                            await self.schedule_task_reminders_for_task(session, new_task)

    def _get_recurring_tasks_without_instances(self, session: Session):
        """
        Internal method to get recurring tasks that need new instances
        """
        # This would implement the logic to find recurring tasks that need new instances
        # based on their recurrence pattern and last occurrence
        pass

    def _calculate_next_occurrence_date(self, recurrence_pattern: RecurrencePattern, last_occurrence: datetime) -> datetime:
        """
        Calculate the next occurrence date based on the recurrence pattern
        """
        if recurrence_pattern.frequency == "daily":
            return last_occurrence + timedelta(days=recurrence_pattern.interval)
        elif recurrence_pattern.frequency == "weekly":
            return last_occurrence + timedelta(weeks=recurrence_pattern.interval)
        elif recurrence_pattern.frequency == "monthly":
            # For monthly, we need to handle month boundaries
            from dateutil.relativedelta import relativedelta
            return last_occurrence + relativedelta(months=recurrence_pattern.interval)
        elif recurrence_pattern.frequency == "yearly":
            from dateutil.relativedelta import relativedelta
            return last_occurrence + relativedelta(years=recurrence_pattern.interval)
        
        return None

    def _should_end_recurrence(self, recurrence_pattern: RecurrencePattern, occurrence_count: int, current_date: datetime) -> bool:
        """
        Determine if a recurrence should end based on its end conditions
        """
        if recurrence_pattern.end_condition == "never":
            return False
        elif recurrence_pattern.end_condition == "after":
            return occurrence_count >= recurrence_pattern.end_after_occurrences
        elif recurrence_pattern.end_condition == "on_date":
            return current_date > recurrence_pattern.end_date
        
        return False

    def _count_task_instances(self, session: Session, task_id: uuid.UUID) -> int:
        """
        Count the number of instances for a recurring task
        """
        # This would implement the logic to count related recurring task instances
        pass

    def _create_task_instance(self, session: Session, task_data: dict):
        """
        Create a new instance of a recurring task
        """
        # This would implement the logic to create a new task instance
        # based on the original recurring task
        pass

    async def schedule_task_reminders_for_task(self, session: Session, task):
        """
        Schedule a reminder for a specific task
        """
        # This would schedule a specific reminder for the given task
        # based on user preferences and task due date
        pass

    async def run_scheduler(self, session: Session):
        """
        Main method to run the notification scheduler
        This should be called periodically by a background job processor
        """
        # Schedule reminders for tasks with due dates
        await self.schedule_task_reminders(session)
        
        # Schedule new instances for recurring tasks
        await self.schedule_recurring_task_notifications(session)