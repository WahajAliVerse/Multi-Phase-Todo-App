"""
Task service for the todo application.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.task import Task, TaskStatus, TaskPriority
from ..models.user import User
from ..models.tag import Tag
from datetime import datetime


def create_task(
    db: Session,
    title: str,
    description: Optional[str] = None,
    user_id: int = None,
    priority: TaskPriority = TaskPriority.medium,
    due_date: Optional[datetime] = None,
    tag_ids: Optional[List[int]] = None
) -> Task:
    """
    Create a new task.
    """
    db_task = Task(
        title=title,
        description=description,
        user_id=user_id,
        priority=priority,
        due_date=due_date
    )
    
    # Add tags if provided
    if tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        db_task.tags.extend(tags)
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def get_task(db: Session, task_id: int) -> Optional[Task]:
    """
    Get a task by ID.
    """
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    search: Optional[str] = None
) -> List[Task]:
    """
    Get tasks for a user with optional filters.
    """
    query = db.query(Task).filter(Task.user_id == user_id)
    
    if status:
        query = query.filter(Task.status == status)
    
    if priority:
        query = query.filter(Task.priority == priority)
    
    if search:
        query = query.filter(Task.title.contains(search) | Task.description.contains(search))
    
    return query.offset(skip).limit(limit).all()


def update_task(
    db: Session,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    due_date: Optional[datetime] = None,
    tag_ids: Optional[List[int]] = None
) -> Optional[Task]:
    """
    Update a task.
    """
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    if title is not None:
        db_task.title = title
    if description is not None:
        db_task.description = description
    if status is not None:
        db_task.status = status
    if priority is not None:
        db_task.priority = priority
    if due_date is not None:
        db_task.due_date = due_date
    
    # Update tags if provided
    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        db_task.tags = tags
    
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    """
    Delete a task.
    """
    db_task = get_task(db, task_id)
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    return True


def toggle_task_status(db: Session, task_id: int) -> Optional[Task]:
    """
    Toggle a task's status between active and completed.
    """
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    if db_task.status == TaskStatus.active:
        db_task.status = TaskStatus.completed
        db_task.completed_at = datetime.utcnow()
    else:
        db_task.status = TaskStatus.active
        db_task.completed_at = None
    
    db.commit()
    db.refresh(db_task)
    return db_task