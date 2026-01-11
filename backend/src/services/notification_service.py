import asyncio
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import BackgroundTasks

from ..models.task import Task
from ..services.task_service import TaskService


class NotificationService:
    @staticmethod
    async def send_notification(user_id: str, message: str, task_id: Optional[str] = None):
        """
        Send a notification to a user
        In a real implementation, this would interface with a notification system
        like Firebase, email, or WebSocket connections
        """
        print(f"Notification for user {user_id}: {message}")
        if task_id:
            print(f"Related to task: {task_id}")
        # In a real implementation, this would send actual notifications
        # via email, push notifications, or WebSocket connections

    @staticmethod
    def schedule_due_date_reminders(db, background_tasks: BackgroundTasks):
        """
        Schedule background tasks to send reminders for upcoming due dates
        """
        # Find tasks with due dates in the next hour
        upcoming_tasks = db.query(Task).filter(
            Task.due_date <= datetime.utcnow() + timedelta(hours=1),
            Task.due_date >= datetime.utcnow(),
            Task.status == 'active'
        ).all()

        for task in upcoming_tasks:
            # Calculate time until due date
            time_until_due = task.due_date - datetime.utcnow()
            delay_seconds = max(0, time_until_due.total_seconds())

            # Schedule notification
            background_tasks.add_task(
                NotificationService.send_notification,
                user_id=task.user_id,
                message=f"Task '{task.title}' is due soon!",
                task_id=task.id
            )

    @staticmethod
    async def send_overdue_notifications(db):
        """
        Send notifications for overdue tasks
        """
        # Find tasks that are overdue (due date is in the past and status is active)
        overdue_tasks = db.query(Task).filter(
            Task.due_date < datetime.utcnow(),
            Task.status == 'active'
        ).all()

        for task in overdue_tasks:
            await NotificationService.send_notification(
                user_id=task.user_id,
                message=f"Task '{task.title}' is overdue!",
                task_id=task.id
            )

    @staticmethod
    async def send_task_completion_confirmation(user_id: str, task_title: str):
        """
        Send a confirmation notification when a task is completed
        """
        await NotificationService.send_notification(
            user_id=user_id,
            message=f"Task '{task_title}' has been marked as complete!"
        )

    @staticmethod
    async def send_recurring_task_created(user_id: str, task_title: str):
        """
        Send a notification when a recurring task instance is created
        """
        await NotificationService.send_notification(
            user_id=user_id,
            message=f"New instance of recurring task '{task_title}' has been created."
        )