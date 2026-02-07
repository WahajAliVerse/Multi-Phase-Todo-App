from typing import Optional, List
from sqlmodel import Session
from backend.src.models.task import Task, TaskCreate, TaskUpdate
from backend.src.models.recurrence_pattern import RecurrencePattern
from backend.src.schemas.task import TaskRead
from backend.src.repositories.task_repository import TaskRepository
from backend.src.services.recurrence_service import RecurrenceService
from datetime import datetime


class TaskService:
    def __init__(self):
        self.repository = TaskRepository()
        self.recurrence_service = RecurrenceService()

    def create_task(self, session: Session, task_create: TaskCreate) -> Task:
        """
        Create a new task
        """
        # Validate recurrence pattern if provided
        if task_create.recurrence_pattern_id:
            recurrence_pattern = self.recurrence_service.get_recurrence_pattern_by_id(
                session, task_create.recurrence_pattern_id
            )
            if not recurrence_pattern:
                raise ValueError("Invalid recurrence pattern ID")
            
            # Validate the recurrence pattern
            if not self.recurrence_service.validate_recurrence_pattern(recurrence_pattern):
                raise ValueError("Invalid recurrence pattern")
        
        return self.repository.create_task(session, task_create)

    def get_task_by_id(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Task]:
        """
        Get a task by ID for a specific user
        """
        return self.repository.get_task_by_id(session, task_id, user_id)

    def get_tasks_by_user(
        self, 
        session: Session, 
        user_id: uuid.UUID, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = "asc",
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        tag_ids: Optional[List[uuid.UUID]] = None
    ) -> List[Task]:
        """
        Get all tasks for a specific user with optional filters and pagination
        """
        return self.repository.get_tasks_by_user(
            session, user_id, skip, limit, status, priority, search, sort_by, sort_order, date_from, date_to, tag_ids
        )

    def update_task(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID, task_update: TaskUpdate) -> Optional[Task]:
        """
        Update a task's information
        """
        # If recurrence pattern is being updated, validate it
        if task_update.recurrence_pattern_id:
            recurrence_pattern = self.recurrence_service.get_recurrence_pattern_by_id(
                session, task_update.recurrence_pattern_id
            )
            if not recurrence_pattern:
                raise ValueError("Invalid recurrence pattern ID")

            # Validate the recurrence pattern
            if not self.recurrence_service.validate_recurrence_pattern(recurrence_pattern):
                raise ValueError("Invalid recurrence pattern")

        return self.repository.update_task(session, task_id, user_id, task_update)

    def delete_task(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """
        Delete a task
        """
        return self.repository.delete_task(session, task_id, user_id)

    def mark_task_completed(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Task]:
        """
        Mark a task as completed
        """
        return self.repository.mark_task_completed(session, task_id, user_id)

    def mark_task_incomplete(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Task]:
        """
        Mark a task as incomplete
        """
        return self.repository.mark_task_incomplete(session, task_id, user_id)

    def search_tasks(self, session: Session, user_id: uuid.UUID, search_term: str) -> List[Task]:
        """
        Search tasks by title or description
        """
        return self.repository.get_tasks_by_user(
            session, user_id, search=search_term
        )

    def filter_tasks_by_status(self, session: Session, user_id: uuid.UUID, status: str) -> List[Task]:
        """
        Filter tasks by status
        """
        return self.repository.get_tasks_by_user(
            session, user_id, status=status
        )

    def filter_tasks_by_priority(self, session: Session, user_id: uuid.UUID, priority: str) -> List[Task]:
        """
        Filter tasks by priority
        """
        return self.repository.get_tasks_by_user(
            session, user_id, priority=priority
        )

    def sort_tasks_by_priority(self, session: Session, user_id: uuid.UUID) -> List[Task]:
        """
        Sort tasks by priority (high first, then medium, then low)
        """
        return self.repository.get_tasks_by_user(
            session, user_id, sort_by="priority", sort_order="desc"
        )

    def sort_tasks(self, session: Session, user_id: uuid.UUID, sort_by: str, sort_order: str = "asc") -> List[Task]:
        """
        Sort tasks by a specific field
        """
        return self.repository.get_tasks_by_user(
            session, user_id, sort_by=sort_by, sort_order=sort_order
        )

    def generate_recurring_tasks(self, session: Session) -> int:
        """
        Generate new task instances for recurring tasks that are due
        Returns the number of tasks generated
        """
        from datetime import datetime
        from backend.src.models.task import TaskStatus
        
        # Get all recurring tasks that have instances due to be created
        # Note: This method would need to be implemented in the repository
        recurring_tasks = self.repository.get_recurring_tasks_without_instances(session)
        generated_count = 0
        
        for task in recurring_tasks:
            if task.recurrence_pattern:
                # Check if a new instance should be created based on the recurrence pattern
                next_due_date = self.recurrence_service.generate_next_occurrence_date(
                    task.recurrence_pattern, 
                    task.due_date or task.created_at
                )
                
                # If the next occurrence is due (today or in the past) and hasn't exceeded end conditions
                if next_due_date and next_due_date <= datetime.now():
                    # Check if the recurrence should end
                    occurrence_count = self.repository.count_task_instances(session, task.id)
                    should_end = self.recurrence_service.should_end_recurrence(
                        task.recurrence_pattern, 
                        occurrence_count, 
                        datetime.now()
                    )
                    
                    if not should_end:
                        # Create a new instance of the recurring task
                        new_task_data = TaskCreate(
                            title=task.title,
                            description=task.description,
                            status=TaskStatus.PENDING,
                            priority=task.priority,
                            due_date=next_due_date,
                            user_id=task.user_id,
                            recurrence_pattern_id=task.recurrence_pattern_id,
                            tag_ids=self.repository.get_task_tag_ids(session, task.id)  # Copy tags to new instance
                        )
                        
                        new_task = self.create_task(session, new_task_data)
                        generated_count += 1
        
        return generated_count

    def get_recurring_tasks_for_user(self, session: Session, user_id: uuid.UUID) -> List[Task]:
        """
        Get all recurring tasks for a specific user
        """
        return self.repository.get_recurring_tasks_by_user(session, user_id)

    def handle_recurring_task_completion(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """
        Handle the completion of a recurring task instance
        For recurring tasks, completing one instance shouldn't affect the pattern
        """
        task = self.get_task_by_id(session, task_id, user_id)
        if not task:
            return False
            
        # If this is a recurring task instance, we might want to handle it specially
        # For example, we could create the next instance in the sequence
        if task.recurrence_pattern_id:
            # Mark as complete but also potentially schedule the next occurrence
            # (though typically, recurring tasks are pre-generated based on their pattern)
            completed_task = self.mark_task_completed(session, task_id, user_id)
            
            # If this is part of a recurring pattern, we might generate the next occurrence
            # (though typically, recurring tasks are pre-generated based on their pattern)
            return completed_task is not None
        else:
            # For non-recurring tasks, just mark as complete normally
            return self.mark_task_completed(session, task_id, user_id) is not None