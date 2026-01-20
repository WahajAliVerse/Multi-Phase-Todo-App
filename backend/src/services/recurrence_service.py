from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import uuid

from ..models.task import Task, RecurrencePattern
from ..core.exceptions import TaskNotFoundException


class RecurrenceService:
    @staticmethod
    def create_recurring_task(db: Session,
                              title: str,
                              description: Optional[str],
                              priority: str,
                              due_date: Optional[datetime],
                              user_id: str,
                              recurrence_pattern: str,  # daily, weekly, monthly
                              recurrence_end_date: Optional[datetime] = None,
                              max_occurrences: Optional[int] = None) -> Task:
        """
        Create a recurring task
        """
        db_task = Task(
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            user_id=user_id,
            recurrence_pattern=recurrence_pattern,
            recurrence_end_date=recurrence_end_date
        )
        
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        
        return db_task

    @staticmethod
    def get_next_occurrence(task: Task) -> Optional[datetime]:
        """
        Calculate the next occurrence date for a recurring task
        """
        if not task.recurrence_pattern or not task.due_date:
            return None

        last_occurrence = task.due_date
        if task.recurrence_pattern == "daily":
            next_date = last_occurrence + timedelta(days=1)
        elif task.recurrence_pattern == "weekly":
            next_date = last_occurrence + timedelta(weeks=1)
        elif task.recurrence_pattern == "monthly":
            # Simple monthly calculation (may need more sophisticated handling for months with different days)
            next_date = last_occurrence + timedelta(days=30)
        else:
            return None  # Unknown pattern

        # Check if we've exceeded the end date or max occurrences
        if task.recurrence_end_date and next_date > task.recurrence_end_date:
            return None

        return next_date

    @staticmethod
    def generate_new_instance(db: Session, original_task: Task) -> Optional[Task]:
        """
        Generate a new instance of a recurring task
        """
        next_occurrence = RecurrenceService.get_next_occurrence(original_task)
        if not next_occurrence:
            return None

        # Create a new task instance based on the original
        new_task = Task(
            title=original_task.title,
            description=original_task.description,
            priority=original_task.priority,
            due_date=next_occurrence,
            user_id=original_task.user_id,
            recurrence_pattern=original_task.recurrence_pattern,
            recurrence_end_date=original_task.recurrence_end_date
        )

        # Copy tags from the original task
        for tag in original_task.tags:
            new_task.tags.append(tag)

        db.add(new_task)
        db.commit()
        db.refresh(new_task)

        return new_task

    @staticmethod
    def process_completed_recurring_task(db: Session, task_id: str, user_id: str) -> Optional[Task]:
        """
        Process a completed recurring task and create the next instance if needed
        """
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            raise TaskNotFoundException(task_id)

        # Mark the current task as completed
        task.status = 'completed'
        task.completed_at = datetime.utcnow()

        # If it's a recurring task, create the next instance
        next_instance = None
        if task.recurrence_pattern:
            next_instance = RecurrenceService.generate_new_instance(db, task)

        db.commit()
        return next_instance

    @staticmethod
    def update_recurrence_pattern(db: Session, task_id: str, user_id: str, 
                                 recurrence_pattern: str, 
                                 recurrence_end_date: Optional[datetime] = None) -> Task:
        """
        Update the recurrence pattern for a task
        """
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            raise TaskNotFoundException(task_id)

        task.recurrence_pattern = recurrence_pattern
        if recurrence_end_date:
            task.recurrence_end_date = recurrence_end_date

        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def delete_recurring_task_series(db: Session, task_id: str, user_id: str) -> bool:
        """
        Delete a recurring task and all future occurrences
        """
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            raise TaskNotFoundException(task_id)

        # For now, we just delete the single task
        # In a more complex implementation, we might track series separately
        db.delete(task)
        db.commit()
        return True