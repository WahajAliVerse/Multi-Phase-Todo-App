from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..models.reminder import Reminder
from ..models.task import Task
from ..database.database import get_db
from fastapi import Depends

class ReminderService:
    def __init__(self, db: Session):
        self.db = db

    def create_reminder(
        self,
        task_id: int,
        scheduled_time: datetime,
        user_id: int  # Added user_id to ensure user owns the task
    ) -> Reminder:
        """Create a new reminder for a task."""
        # Verify that the task belongs to the user
        task = self.db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == user_id
        ).first()
        
        if not task:
            raise ValueError("Task not found or does not belong to user")
        
        # Verify that scheduled time is in the future
        if scheduled_time <= datetime.utcnow():
            raise ValueError("Scheduled time must be in the future")
        
        # Create the reminder
        db_reminder = Reminder(
            task_id=task_id,
            scheduled_time=scheduled_time,
            delivery_status='pending'
        )
        
        self.db.add(db_reminder)
        self.db.commit()
        self.db.refresh(db_reminder)
        
        return db_reminder

    def get_reminders_by_user(self, user_id: int) -> List[Reminder]:
        """Retrieve all reminders for tasks belonging to a user."""
        return self.db.query(Reminder).join(Task).filter(
            Task.user_id == user_id
        ).all()

    def get_reminder_by_id(self, reminder_id: int, user_id: int) -> Optional[Reminder]:
        """Retrieve a specific reminder by ID for a user."""
        return self.db.query(Reminder).join(Task).filter(
            Reminder.id == reminder_id,
            Task.user_id == user_id
        ).first()

    def update_reminder(
        self,
        reminder_id: int,
        user_id: int,
        scheduled_time: datetime = None,
        delivery_status: str = None
    ) -> Optional[Reminder]:
        """Update an existing reminder."""
        reminder = self.get_reminder_by_id(reminder_id, user_id)
        if not reminder:
            return None
        
        # Update fields if provided
        if scheduled_time is not None:
            if scheduled_time <= datetime.utcnow():
                raise ValueError("Scheduled time must be in the future")
            reminder.scheduled_time = scheduled_time
        
        if delivery_status is not None:
            valid_statuses = ['pending', 'sent', 'delivered', 'failed']
            if delivery_status not in valid_statuses:
                raise ValueError(f"Delivery status must be one of {valid_statuses}")
            reminder.delivery_status = delivery_status
        
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def delete_reminder(self, reminder_id: int, user_id: int) -> bool:
        """Delete a reminder by ID for a user."""
        reminder = self.get_reminder_by_id(reminder_id, user_id)
        if not reminder:
            return False
        
        self.db.delete(reminder)
        self.db.commit()
        return True

    def get_pending_reminders(self) -> List[Reminder]:
        """Get all pending reminders that are scheduled for the past."""
        return self.db.query(Reminder).filter(
            Reminder.delivery_status == 'pending',
            Reminder.scheduled_time <= datetime.utcnow()
        ).all()

    def mark_reminder_as_sent(self, reminder_id: int) -> Optional[Reminder]:
        """Mark a reminder as sent."""
        reminder = self.db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if not reminder:
            return None
        
        reminder.delivery_status = 'sent'
        reminder.sent_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def mark_reminder_as_delivered(self, reminder_id: int) -> Optional[Reminder]:
        """Mark a reminder as delivered."""
        reminder = self.db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if not reminder:
            return None
        
        reminder.delivery_status = 'delivered'
        
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

def get_reminder_service(db: Session = Depends(get_db)):
    """Dependency to get reminder service instance."""
    return ReminderService(db)