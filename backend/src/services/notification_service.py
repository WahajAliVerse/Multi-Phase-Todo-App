from typing import Optional, List
import uuid
from sqlmodel import Session
from src.models.notification import Notification, NotificationCreate, NotificationUpdate
from src.schemas.notification import NotificationRead
from src.repositories.notification_repository import NotificationRepository
from src.services.email_service import EmailService
from datetime import datetime


class NotificationService:
    def __init__(self):
        self.repository = NotificationRepository()
        self.email_service = EmailService()

    def create_notification(self, session: Session, notification_create: NotificationCreate) -> Notification:
        """
        Create a new notification
        """
        return self.repository.create_notification(session, notification_create)

    def get_notification_by_id(self, session: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Notification]:
        """
        Get a notification by ID for a specific user
        """
        return self.repository.get_notification_by_id(session, notification_id, user_id)

    def get_notifications_by_user(
        self, 
        session: Session, 
        user_id: uuid.UUID, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None,
        type: Optional[str] = None,
        unread_only: bool = False
    ) -> List[Notification]:
        """
        Get all notifications for a specific user with optional filters and pagination
        """
        return self.repository.get_notifications_by_user(
            session, user_id, skip, limit, status, type, unread_only
        )

    def get_pending_notifications(self, session: Session, user_id: uuid.UUID) -> List[Notification]:
        """
        Get all pending notifications for a specific user
        """
        return self.repository.get_pending_notifications(session, user_id)

    def update_notification(self, session: Session, notification_id: uuid.UUID, user_id: uuid.UUID, notification_update: NotificationUpdate) -> Optional[Notification]:
        """
        Update a notification's information
        """
        return self.repository.update_notification(session, notification_id, user_id, notification_update)

    def mark_notification_as_read(self, session: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Notification]:
        """
        Mark a notification as read
        """
        return self.repository.mark_notification_as_read(session, notification_id, user_id)

    def delete_notification(self, session: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """
        Delete a notification
        """
        return self.repository.delete_notification(session, notification_id, user_id)

    def send_task_reminder(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID, reminder_time: datetime) -> bool:
        """
        Send a reminder notification for a task
        """
        from src.models.task import Task
        from sqlmodel import select
        
        # Get the task
        task_statement = select(Task).where(Task.id == task_id)
        task = session.exec(task_statement).first()
        
        if not task:
            return False
            
        # Create notification content
        title = f"Task Reminder: {task.title}"
        message = f"Your task '{task.title}' is due soon."
        
        # Create notification
        notification_data = NotificationCreate(
            type="browser",  # Default to browser notification
            title=title,
            message=message,
            user_id=user_id,
            task_id=task_id
        )
        
        notification = self.create_notification(session, notification_data)
        
        # If the user wants email notifications, send email too
        user_service = UserService()  # Assuming UserService exists
        user = user_service.get_user_by_id(session, user_id)
        
        if user and user.notification_settings.get("email", False):
            # Send email notification
            email_sent = self.email_service.send_task_reminder_email(
                recipient_email=user.email,
                task_title=task.title,
                task_description=task.description,
                due_date=task.due_date
            )
            
            if email_sent:
                # Update notification to indicate email was sent
                email_notification = NotificationCreate(
                    type="email",
                    title=title,
                    message=message,
                    user_id=user_id,
                    task_id=task_id
                )
                self.create_notification(session, email_notification)
        
        return notification is not None

    def send_browser_notification(self, session: Session, user_id: uuid.UUID, title: str, message: str, task_id: Optional[uuid.UUID] = None) -> bool:
        """
        Send a browser notification to a user
        """
        notification_data = NotificationCreate(
            type="browser",
            title=title,
            message=message,
            user_id=user_id,
            task_id=task_id
        )
        
        notification = self.create_notification(session, notification_data)
        return notification is not None

    def send_email_notification(self, session: Session, user_id: uuid.UUID, title: str, message: str, task_id: Optional[uuid.UUID] = None) -> bool:
        """
        Send an email notification to a user
        """
        from src.services.user_service import UserService
        
        user_service = UserService()
        user = user_service.get_user_by_id(session, user_id)
        
        if not user:
            return False
            
        # Send email notification
        email_sent = self.email_service.send_notification_email(
            recipient_email=user.email,
            subject=title,
            body=message
        )
        
        if email_sent:
            # Create notification record
            notification_data = NotificationCreate(
                type="email",
                title=title,
                message=message,
                user_id=user_id,
                task_id=task_id
            )
            
            notification = self.create_notification(session, notification_data)
            return notification is not None
        
        return False

    def get_unread_notification_count(self, session: Session, user_id: uuid.UUID) -> int:
        """
        Get the count of unread notifications for a user
        """
        unread_notifications = self.repository.get_notifications_by_user(
            session, user_id, status="sent", unread_only=True
        )
        return len(unread_notifications)