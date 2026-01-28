from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from datetime import datetime
from ..models.task import Task, TaskStatus, TaskPriority
from ..models.tag import Tag
from ..models.user import User
from ..schemas.task import TaskCreate, TaskUpdate


class TaskService:
    """
    Service class for task operations.
    """

    @staticmethod
    def create_task(
        db: Session,
        title: str,
        description: Optional[str],
        status: TaskStatus,
        priority: TaskPriority,
        due_date: Optional[datetime],
        recurrence_pattern: Optional[str],
        user_id: int,
        tag_ids: Optional[List[int]] = None
    ) -> Task:
        """
        Create a new task.
        """
        # Create the task
        db_task = Task(
            title=title,
            description=description,
            status=status,
            priority=priority,
            due_date=due_date,
            recurrence_pattern=recurrence_pattern,
            user_id=user_id
        )

        # Add tags if provided
        if tag_ids:
            tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
            db_task.tags.extend(tags)

        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
        """
        Get a task by ID.
        """
        return db.query(Task).filter(Task.id == task_id).first()

    @staticmethod
    def get_tasks(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[Task], int]:
        """
        Get tasks for a user with optional filtering and pagination.
        """
        query = db.query(Task).filter(Task.user_id == user_id)

        # Apply filters
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if search:
            query = query.filter(Task.title.contains(search) | Task.description.contains(search))

        # Get total count for pagination
        total = query.count()

        # Apply pagination
        tasks = query.offset(skip).limit(limit).all()

        return tasks, total

    @staticmethod
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
        db_task = TaskService.get_task_by_id(db, task_id)
        if not db_task:
            return None

        # Update fields if provided
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

    @staticmethod
    def delete_task(db: Session, task_id: int) -> bool:
        """
        Delete a task.
        """
        db_task = TaskService.get_task_by_id(db, task_id)
        if not db_task:
            return False

        db.delete(db_task)
        db.commit()
        return True

    @staticmethod
    def toggle_task_status(db: Session, task_id: int) -> Optional[Task]:
        """
        Toggle task status between active and completed.
        """
        db_task = TaskService.get_task_by_id(db, task_id)
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