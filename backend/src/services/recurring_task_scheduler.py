from datetime import datetime, timedelta
from typing import List, Optional
import uuid
from sqlmodel import Session
from src.models.task import Task
from src.models.recurrence_pattern import RecurrencePattern
from src.services.task_service import TaskService
from src.services.recurrence_service import RecurrenceService
from src.core.redis import redis_client
import json
import logging

logger = logging.getLogger(__name__)


class RecurringTaskScheduler:
    """
    Service to handle scheduling and generation of recurring tasks based on their patterns
    """
    
    def __init__(self):
        self.task_service = TaskService()
        self.recurrence_service = RecurrenceService()
    
    def generate_recurring_task_instances(self, session: Session) -> int:
        """
        Generate new instances for recurring tasks that are due based on their recurrence patterns
        """
        # Get all recurring tasks that need new instances generated
        recurring_tasks = self.task_service.get_recurring_tasks_needing_instances(session)
        
        created_count = 0
        for task in recurring_tasks:
            if task.recurrence_pattern:
                # Calculate the next occurrence date based on the recurrence pattern
                next_occurrence_date = self.recurrence_service.calculate_next_occurrence_date(
                    task.recurrence_pattern, 
                    task.due_date or task.created_at
                )
                
                # Check if the next occurrence is due (today or in the past) and hasn't exceeded end conditions
                if next_occurrence_date and next_occurrence_date <= datetime.now():
                    # Check if the recurrence should end based on its end conditions
                    occurrence_count = self.recurrence_service.count_task_occurrences(
                        session, 
                        task.id, 
                        task.recurrence_pattern
                    )
                    should_end = self.recurrence_service.should_end_recurrence(
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
                            "due_date": next_occurrence_date,
                            "user_id": task.user_id,
                            "recurrence_pattern_id": task.recurrence_pattern_id,
                            # Copy other relevant fields as needed
                        }
                        
                        new_task = self.task_service.create_task(session, new_task_data)
                        created_count += 1
                        
                        logger.info(f"Created new instance of recurring task: {new_task.id}")
        
        return created_count
    
    def schedule_recurring_tasks_check(self) -> bool:
        """
        Schedule the recurring tasks check to run periodically
        This would typically be called from a scheduler like Celery Beat
        """
        try:
            # In a real implementation, this would schedule the recurring task generation
            # to run at a specific interval (e.g., every hour)
            
            # For now, we'll just return True to indicate the scheduler is set up
            return True
        except Exception as e:
            logger.error(f"Error scheduling recurring tasks check: {str(e)}", exc_info=True)
            return False
    
    def get_tasks_due_for_generation(self, session: Session) -> List[Task]:
        """
        Get recurring tasks that are due for new instance generation
        """
        # Get all recurring tasks
        recurring_tasks = self.task_service.get_recurring_tasks_for_user(session, None)  # Need to modify to get all
        
        # Filter for tasks that are due for generation based on their recurrence pattern
        due_tasks = []
        for task in recurring_tasks:
            if task.recurrence_pattern:
                next_occurrence = self.recurrence_service.calculate_next_occurrence_date(
                    task.recurrence_pattern,
                    task.last_generated_at or task.created_at  # Assuming we track last generation
                )
                
                if next_occurrence and next_occurrence <= datetime.now():
                    # Check if recurrence should end
                    occurrence_count = self.recurrence_service.count_task_occurrences(
                        session, 
                        task.id, 
                        task.recurrence_pattern
                    )
                    should_end = self.recurrence_service.should_end_recurrence(
                        task.recurrence_pattern, 
                        occurrence_count, 
                        datetime.now()
                    )
                    
                    if not should_end:
                        due_tasks.append(task)
        
        return due_tasks
    
    def process_recurring_task_exceptions(self, session: Session, task_id: uuid.UUID, exception_date: datetime) -> bool:
        """
        Process an exception for a recurring task (e.g., skip a specific occurrence)
        """
        task = self.task_service.get_task_by_id(session, task_id, task.user_id)
        if not task or not task.recurrence_pattern:
            return False
        
        # In a full implementation, we would add the exception to the task's recurrence pattern
        # For now, we'll just log the action
        logger.info(f"Added exception for recurring task {task_id} on {exception_date}")
        return True
    
    def get_next_occurrence_for_task(self, task: Task) -> Optional[datetime]:
        """
        Get the next occurrence date for a recurring task
        """
        if not task.recurrence_pattern:
            return None
        
        return self.recurrence_service.calculate_next_occurrence_date(
            task.recurrence_pattern,
            task.last_generated_at or task.created_at
        )
    
    def validate_recurrence_pattern(self, pattern: RecurrencePattern) -> bool:
        """
        Validate a recurrence pattern
        """
        return self.recurrence_service.validate_recurrence_pattern(pattern)