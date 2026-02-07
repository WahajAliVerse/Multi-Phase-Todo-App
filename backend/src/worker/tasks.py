from celery import current_task
from backend.src.worker.celery_app import celery_app
from backend.src.core.database import get_session
from backend.src.services.task_service import TaskService
from backend.src.services.recurrence_service import RecurrenceService
from backend.src.models.task import Task
from sqlmodel import Session
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@celery_app.task(bind=True)
def create_recurring_tasks(self):
    """
    Background task to generate new instances of recurring tasks based on their patterns
    """
    logger.info("Starting recurring task creation process")
    
    try:
        # Get a database session
        session_gen = get_session()
        session: Session = next(session_gen)
        
        try:
            task_service = TaskService()
            recurrence_service = RecurrenceService()
            
            # Get all recurring tasks that need new instances generated
            recurring_tasks = task_service.get_recurring_tasks_needing_instances(session)
            
            created_count = 0
            for task in recurring_tasks:
                if task.recurrence_pattern:
                    # Check if a new instance should be created based on the recurrence pattern
                    next_due_date = recurrence_service.calculate_next_occurrence(
                        task.recurrence_pattern, 
                        task.due_date or task.created_at
                    )
                    
                    # If the next occurrence is due (today or in the past) and hasn't exceeded end conditions
                    if next_due_date and next_due_date <= datetime.now():
                        # Check if the recurrence should end
                        occurrence_count = recurrence_service.count_occurrences_for_task(session, task.id)
                        should_end = recurrence_service.should_end_recurrence(
                            task.recurrence_pattern, 
                            occurrence_count
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
                            
                            new_task = task_service.create_task(session, new_task_data)
                            created_count += 1
                            logger.info(f"Created new instance of recurring task: {new_task.id}")
            
            logger.info(f"Recurring task creation process completed. Created {created_count} new tasks.")
            return {"status": "success", "created_count": created_count}
            
        finally:
            session.close()
            # Close the generator
            try:
                next(session_gen)
            except StopIteration:
                pass
                
    except Exception as e:
        logger.error(f"Error in recurring task creation: {str(e)}", exc_info=True)
        # Retry the task with exponential backoff
        raise self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True)
def process_task_notifications(self, task_id: str):
    """
    Background task to process notifications for a specific task
    """
    logger.info(f"Processing notifications for task {task_id}")
    
    try:
        # Get a database session
        session_gen = get_session()
        session: Session = next(session_gen)
        
        try:
            task_service = TaskService()
            
            # Get the task
            task = task_service.get_task_by_id(session, task_id)
            if not task:
                logger.warning(f"Task {task_id} not found for notification processing")
                return {"status": "error", "message": "Task not found"}
            
            # Process notifications based on task status and due date
            notification_processed = task_service.process_task_notifications(session, task)
            
            logger.info(f"Notification processing completed for task {task_id}. Notifications sent: {notification_processed}")
            return {"status": "success", "notifications_sent": notification_processed}
            
        finally:
            session.close()
            # Close the generator
            try:
                next(session_gen)
            except StopIteration:
                pass
                
    except Exception as e:
        logger.error(f"Error processing notifications for task {task_id}: {str(e)}", exc_info=True)
        raise self.retry(exc=e, countdown=30, max_retries=3)


@celery_app.task(bind=True)
def cleanup_expired_tasks(self):
    """
    Background task to clean up expired or completed recurring task instances
    """
    logger.info("Starting expired task cleanup process")
    
    try:
        # Get a database session
        session_gen = get_session()
        session: Session = next(session_gen)
        
        try:
            task_service = TaskService()
            
            # Clean up expired tasks based on retention policy
            cleaned_count = task_service.cleanup_expired_tasks(session)
            
            logger.info(f"Expired task cleanup completed. Removed {cleaned_count} tasks.")
            return {"status": "success", "cleaned_count": cleaned_count}
            
        finally:
            session.close()
            # Close the generator
            try:
                next(session_gen)
            except StopIteration:
                pass
                
    except Exception as e:
        logger.error(f"Error in expired task cleanup: {str(e)}", exc_info=True)
        raise self.retry(exc=e, countdown=120, max_retries=2)