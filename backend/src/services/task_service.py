from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime

from ..models.task import Task
from ..models.tag import Tag
from ..models.reminder import Reminder
from ..database.database import get_db
from fastapi import Depends

class TaskService:
    def __init__(self, db: Session):
        self.db = db

    def create_task(
        self,
        title: str,
        description: str = None,
        priority: str = 'medium',
        due_date: datetime = None,
        user_id: int = None,
        recurrence_pattern_id: int = None,
        tag_ids: List[int] = None
    ) -> Task:
        """Create a new task with the provided details."""
        # Validate priority
        if priority not in ['high', 'medium', 'low']:
            raise ValueError("Priority must be 'high', 'medium', or 'low'")
        
        # Validate status
        status = 'active'  # Default to active when creating
        
        # Create the task
        db_task = Task(
            title=title,
            description=description,
            status=status,
            priority=priority,
            due_date=due_date,
            user_id=user_id,
            recurrence_pattern_id=recurrence_pattern_id
        )
        
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        
        # Associate tags if provided
        if tag_ids:
            tags = self.db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
            # In a real implementation, we'd associate tags with the task
            # This would depend on the exact relationship implementation
        
        return db_task

    def get_tasks(
        self,
        user_id: int,
        status: str = None,
        priority: str = None,
        search: str = None,
        sort_by: str = 'created_at',
        sort_order: str = 'desc',
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """Retrieve tasks for a user with optional filtering and sorting."""
        query = self.db.query(Task).filter(Task.user_id == user_id)
        
        # Apply filters
        if status:
            query = query.filter(Task.status == status)
        
        if priority:
            query = query.filter(Task.priority == priority)
        
        if search:
            query = query.filter(
                or_(
                    Task.title.contains(search),
                    Task.description.contains(search)
                )
            )
        
        # Apply sorting
        if sort_by == 'due_date':
            order_field = Task.due_date
        elif sort_by == 'priority':
            order_field = Task.priority
        elif sort_by == 'title':
            order_field = Task.title
        else:  # default to created_at
            order_field = Task.created_at
            
        if sort_order == 'desc':
            query = query.order_by(order_field.desc())
        else:
            query = query.order_by(order_field.asc())
        
        # Apply pagination
        tasks = query.offset(skip).limit(limit).all()
        return tasks

    def get_task_by_id(self, task_id: int, user_id: int) -> Optional[Task]:
        """Retrieve a specific task by ID for a user."""
        return self.db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == user_id
        ).first()

    def update_task(
        self,
        task_id: int,
        user_id: int,
        title: str = None,
        description: str = None,
        status: str = None,
        priority: str = None,
        due_date: datetime = None,
        recurrence_pattern_id: int = None,
        tag_ids: List[int] = None
    ) -> Optional[Task]:
        """Update an existing task."""
        task = self.get_task_by_id(task_id, user_id)
        if not task:
            return None
        
        # Update fields if provided
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if status is not None:
            if status in ['active', 'completed']:
                task.status = status
                if status == 'completed' and task.completed_at is None:
                    task.completed_at = datetime.utcnow()
                elif status == 'active':
                    task.completed_at = None
        if priority is not None:
            if priority in ['high', 'medium', 'low']:
                task.priority = priority
        if due_date is not None:
            task.due_date = due_date
        if recurrence_pattern_id is not None:
            task.recurrence_pattern_id = recurrence_pattern_id
        
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, task_id: int, user_id: int) -> bool:
        """Delete a task by ID for a user."""
        task = self.get_task_by_id(task_id, user_id)
        if not task:
            return False
        
        self.db.delete(task)
        self.db.commit()
        return True

    def toggle_task_completion(self, task_id: int, user_id: int) -> Optional[Task]:
        """Toggle the completion status of a task."""
        task = self.get_task_by_id(task_id, user_id)
        if not task:
            return None
        
        if task.status == 'active':
            task.status = 'completed'
            task.completed_at = datetime.utcnow()
        else:
            task.status = 'active'
            task.completed_at = None
        
        self.db.commit()
        self.db.refresh(task)
        return task

def get_task_service(db: Session = Depends(get_db)):
    """Dependency to get task service instance."""
    return TaskService(db)