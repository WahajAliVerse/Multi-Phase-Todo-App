from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from sqlalchemy import func

from ..models.task import Task, User, Tag
from ..core.exceptions import TaskNotFoundException, ConcurrentModificationException


class TaskService:
    @staticmethod
    def get_tasks(db: Session, user_id: str,
                 status: Optional[str] = None,
                 priority: Optional[str] = None,
                 search: Optional[str] = None,
                 sort: Optional[str] = None,
                 order: Optional[str] = 'asc',
                 limit: Optional[int] = 50,
                 offset: Optional[int] = 0) -> List[Task]:
        """
        Retrieve tasks for a specific user with optional filters
        """
        query = db.query(Task).filter(Task.user_id == user_id)

        # Apply filters
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if search:
            query = query.filter(Task.title.contains(search) | Task.description.contains(search))

        # Apply sorting
        if sort == 'due_date':
            sort_field = Task.due_date
        elif sort == 'priority':
            sort_field = Task.priority
        elif sort == 'title':
            sort_field = Task.title
        elif sort == 'created_at':
            sort_field = Task.created_at
        else:
            sort_field = Task.created_at

        if order == 'desc':
            query = query.order_by(sort_field.desc())
        else:
            query = query.order_by(sort_field.asc())

        # Apply pagination
        tasks = query.offset(offset).limit(limit).all()
        return tasks

    @staticmethod
    def search_tasks(db: Session, user_id: str, search_term: str) -> List[Task]:
        """
        Search tasks by title or description
        """
        return db.query(Task).filter(
            Task.user_id == user_id,
            (Task.title.contains(search_term)) | (Task.description.contains(search_term))
        ).all()

    @staticmethod
    def filter_tasks(db: Session, user_id: str,
                     status: Optional[str] = None,
                     priority: Optional[str] = None,
                     date_from: Optional[datetime] = None,
                     date_to: Optional[datetime] = None) -> List[Task]:
        """
        Filter tasks by various criteria
        """
        query = db.query(Task).filter(Task.user_id == user_id)

        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if date_from:
            query = query.filter(Task.due_date >= date_from)
        if date_to:
            query = query.filter(Task.due_date <= date_to)

        return query.all()

    @staticmethod
    def sort_tasks(db: Session, user_id: str, sort_by: str, order: str = 'asc') -> List[Task]:
        """
        Sort tasks by a specific field
        """
        query = db.query(Task).filter(Task.user_id == user_id)

        # Determine sort field
        if sort_by == 'due_date':
            sort_field = Task.due_date
        elif sort_by == 'priority':
            sort_field = Task.priority
        elif sort_by == 'title':
            sort_field = Task.title
        elif sort_by == 'created_at':
            sort_field = Task.created_at
        else:
            sort_field = Task.created_at  # default sort field

        # Apply sort order
        if order.lower() == 'desc':
            query = query.order_by(sort_field.desc())
        else:
            query = query.order_by(sort_field.asc())

        return query.all()

    @staticmethod
    def get_task_by_id(db: Session, task_id: str, user_id: str) -> Task:
        """
        Retrieve a specific task by ID for a user
        """
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            raise TaskNotFoundException(task_id)
        return task

    @staticmethod
    def create_task(db: Session, 
                   title: str, 
                   description: Optional[str] = None,
                   priority: Optional[str] = 'medium',
                   due_date: Optional[datetime] = None,
                   user_id: str,
                   tags: Optional[List[str]] = None,
                   recurrence_pattern: Optional[str] = None) -> Task:
        """
        Create a new task
        """
        db_task = Task(
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            user_id=user_id,
            recurrence_pattern=recurrence_pattern
        )
        
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        
        # Add tags if provided
        if tags:
            for tag_name in tags:
                tag = db.query(Tag).filter(Tag.name == tag_name, Tag.user_id == user_id).first()
                if tag:
                    db_task.tags.append(tag)
            
            db.commit()
            db.refresh(db_task)
        
        return db_task

    @staticmethod
    def update_task(db: Session, 
                   task_id: str, 
                   user_id: str,
                   title: Optional[str] = None,
                   description: Optional[str] = None,
                   priority: Optional[str] = None,
                   due_date: Optional[datetime] = None,
                   status: Optional[str] = None,
                   tags: Optional[List[str]] = None,
                   version: Optional[int] = None) -> Task:
        """
        Update a task with optimistic locking
        """
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            raise TaskNotFoundException(task_id)
        
        # Check version for optimistic locking
        if version is not None and task.version != version:
            raise ConcurrentModificationException()
        
        # Update fields if provided
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if priority is not None:
            task.priority = priority
        if due_date is not None:
            task.due_date = due_date
        if status is not None:
            task.status = status
            
        # Update version for optimistic locking
        task.version += 1
        
        db.commit()
        db.refresh(task)
        
        # Update tags if provided
        if tags is not None:
            # Clear existing tags
            task.tags.clear()
            
            # Add new tags
            for tag_name in tags:
                tag = db.query(Tag).filter(Tag.name == tag_name, Tag.user_id == user_id).first()
                if tag:
                    task.tags.append(tag)
            
            db.commit()
            db.refresh(task)
        
        return task

    @staticmethod
    def delete_task(db: Session, task_id: str, user_id: str, version: Optional[int] = None) -> bool:
        """
        Delete a task with optimistic locking
        """
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            raise TaskNotFoundException(task_id)
        
        # Check version for optimistic locking
        if version is not None and task.version != version:
            raise ConcurrentModificationException()
        
        db.delete(task)
        db.commit()
        return True

    @staticmethod
    def mark_task_complete(db: Session, task_id: str, user_id: str, version: Optional[int] = None) -> Task:
        """
        Mark a task as complete with optimistic locking
        """
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            raise TaskNotFoundException(task_id)
        
        # Check version for optimistic locking
        if version is not None and task.version != version:
            raise ConcurrentModificationException()
        
        task.status = 'completed'
        task.completed_at = datetime.utcnow()
        task.version += 1
        
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def reopen_task(db: Session, task_id: str, user_id: str, version: Optional[int] = None) -> Task:
        """
        Reopen a completed task with optimistic locking
        """
        task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not task:
            raise TaskNotFoundException(task_id)
        
        # Check version for optimistic locking
        if version is not None and task.version != version:
            raise ConcurrentModificationException()
        
        task.status = 'active'
        task.completed_at = None
        task.version += 1
        
        db.commit()
        db.refresh(task)
        return task