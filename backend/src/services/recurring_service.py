from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from src.models.task import Task
from src.models.recurrence_pattern import RecurrencePattern, RecurrencePatternType
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

class RecurringService:
    def __init__(self):
        """Initialize the recurring service with a scheduler."""
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()

    @staticmethod
    def create_recurring_task(
        db: Session, 
        title: str, 
        description: Optional[str] = None, 
        priority: str = "medium", 
        due_date: Optional[datetime] = None,
        recurrence_pattern: str = "daily",
        interval: int = 1,
        user_id: Optional[int] = None
    ) -> Task:
        """Create a recurring task."""
        # Create the recurrence pattern
        recurrence = RecurrencePattern(
            pattern_type=recurrence_pattern,
            interval=interval
        )
        db.add(recurrence)
        db.flush()  # Get the ID for the recurrence pattern

        # Create the initial task instance
        task = Task(
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            recurrence_pattern=recurrence_pattern,
            next_occurrence=RecurringService.calculate_next_occurrence(
                recurrence_pattern, interval, due_date or datetime.utcnow()
            )
        )
        
        db.add(task)
        db.commit()
        db.refresh(task)
        
        # Schedule the recurring task
        RecurringService.schedule_recurring_task(task, recurrence, db)
        
        return task

    @staticmethod
    def calculate_next_occurrence(pattern_type: str, interval: int, last_occurrence: datetime) -> datetime:
        """Calculate the next occurrence based on the pattern."""
        if pattern_type == "daily":
            return last_occurrence + timedelta(days=interval)
        elif pattern_type == "weekly":
            return last_occurrence + timedelta(weeks=interval)
        elif pattern_type == "monthly":
            # For monthly, we add months to the date
            # This is a simplified version - in practice, you'd need to handle month boundaries
            next_month = last_occurrence.month + interval
            year = last_occurrence.year
            while next_month > 12:
                year += 1
                next_month -= 12
            return last_occurrence.replace(year=year, month=next_month)
        elif pattern_type == "yearly":
            return last_occurrence.replace(year=last_occurrence.year + interval)
        else:
            # Default to daily if pattern is not recognized
            return last_occurrence + timedelta(days=interval)

    @staticmethod
    def schedule_recurring_task(task: Task, recurrence: RecurrencePattern, db: Session):
        """Schedule a recurring task using the scheduler."""
        # Convert the recurrence pattern to a cron expression
        cron_expression = RecurringService.convert_to_cron(recurrence.pattern_type, recurrence.interval)
        
        # Create a job that will create a new task instance when triggered
        def create_new_task_instance():
            # Create a new task instance based on the original task
            new_task = Task(
                title=task.title,
                description=task.description,
                priority=task.priority,
                due_date=RecurringService.calculate_next_occurrence(
                    recurrence.pattern_type, 
                    recurrence.interval, 
                    task.next_occurrence or datetime.utcnow()
                ),
                recurrence_pattern=task.recurrence_pattern,
                next_occurrence=RecurringService.calculate_next_occurrence(
                    recurrence.pattern_type, 
                    recurrence.interval, 
                    task.next_occurrence or datetime.utcnow()
                )
            )
            
            db.add(new_task)
            db.commit()
            
            # Update the original task's next occurrence
            task.next_occurrence = new_task.next_occurrence
            db.commit()
        
        # Schedule the job using the cron expression
        scheduler = BackgroundScheduler()
        scheduler.start()
        scheduler.add_job(
            func=create_new_task_instance,
            trigger=CronTrigger.from_crontab(cron_expression),
            id=f"recurring_task_{task.id}",
            replace_existing=True
        )

    @staticmethod
    def convert_to_cron(pattern_type: str, interval: int) -> str:
        """Convert a recurrence pattern to a cron expression."""
        if pattern_type == "daily":
            # Run every 'interval' days at midnight
            if interval == 1:
                return "0 0 * * *"
            else:
                # For intervals greater than 1, we'll use a simplified approach
                # In practice, you'd need a more sophisticated approach for intervals > 1
                return f"0 0 */{interval} * *"
        elif pattern_type == "weekly":
            # Run every 'interval' weeks on Sunday at midnight
            # This is a simplification - in practice, you'd need to handle week intervals differently
            return "0 0 * * 0"  # Every Sunday
        elif pattern_type == "monthly":
            # Run every 'interval' months on the 1st at midnight
            if interval == 1:
                return "0 0 1 * *"
            else:
                # For intervals greater than 1, we'll use a simplified approach
                return f"0 0 1 */{interval} *"
        elif pattern_type == "yearly":
            # Run every year on January 1st at midnight
            return "0 0 1 1 *"
        else:
            # Default to daily
            return "0 0 * * *"

    @staticmethod
    def update_recurring_task(db: Session, task_id: int, **kwargs) -> Optional[Task]:
        """Update a recurring task."""
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task or not task.recurrence_pattern:
            return None

        # Update task properties
        for key, value in kwargs.items():
            if hasattr(task, key):
                setattr(task, key, value)

        # If recurrence pattern is being updated, reschedule the task
        if 'recurrence_pattern' in kwargs or 'interval' in kwargs:
            recurrence = db.query(RecurrencePattern).filter(
                RecurrencePattern.task_id == task_id
            ).first()
            if recurrence:
                recurrence.pattern_type = kwargs.get('recurrence_pattern', recurrence.pattern_type)
                recurrence.interval = kwargs.get('interval', recurrence.interval)
                
                # Reschedule the task with the new pattern
                RecurringService.schedule_recurring_task(task, recurrence, db)

        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def delete_recurring_task(db: Session, task_id: int) -> bool:
        """Delete a recurring task and cancel its scheduled occurrences."""
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task or not task.recurrence_pattern:
            return False

        # Cancel the scheduled job if it exists
        try:
            scheduler = BackgroundScheduler()
            scheduler.remove_job(f"recurring_task_{task_id}")
        except:
            # Job might not exist or scheduler might not be running
            pass

        # Delete the task
        db.delete(task)
        db.commit()
        return True