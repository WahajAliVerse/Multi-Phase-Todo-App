"""
Notification service for the todo application.
"""

import asyncio
from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from ..models.task import Task
from ..models.user import User


class NotificationService:
    """
    Service to handle sending notifications for upcoming due dates.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def send_due_date_reminder(self, user: User, task: Task):
        """
        Send a reminder notification for a task with an upcoming due date.
        """
        # In a real implementation, this would send an actual notification
        # (email, push notification, etc.)
        print(f"Sending reminder to {user.username} for task '{task.title}' due at {task.due_date}")
        
        # Here we would integrate with a notification system like:
        # - Email service (SMTP)
        # - Push notification service (Firebase, APNs)
        # - SMS service (Twilio)
        # - In-app notifications
        pass
    
    async def schedule_notifications(self):
        """
        Schedule notifications for tasks with upcoming due dates.
        This would typically run as a background task/cron job.
        """
        # Find tasks with due dates within the next hour
        threshold_time = datetime.utcnow() + timedelta(hours=1)
        imminent_tasks = self.db.query(Task).filter(
            Task.due_date <= threshold_time,
            Task.status != "completed"
        ).all()
        
        for task in imminent_tasks:
            user = self.db.query(User).filter(User.id == task.user_id).first()
            await self.send_due_date_reminder(user, task)
    
    async def check_and_send_notifications(self):
        """
        Check for tasks with due dates coming up and send notifications.
        """
        await self.schedule_notifications()