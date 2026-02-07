from typing import Optional, List
import uuid
from sqlmodel import Session, select, and_, or_, case
from src.models.task import Task, TaskCreate, TaskUpdate
from src.models.tag import Tag


class TaskRepository:
    def create_task(self, session: Session, task_create: TaskCreate) -> Task:
        """
        Create a new task in the database
        """
        # Create the task
        db_task = Task(
            title=task_create.title,
            description=task_create.description,
            status=task_create.status,
            priority=task_create.priority,
            due_date=task_create.due_date,
            user_id=task_create.user_id,
            recurrence_pattern=task_create.recurrence_pattern
        )
        
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        
        # Associate tags if provided
        if task_create.tag_ids:
            from sqlmodel import select
            statement = select(Tag).where(Tag.id.in_(task_create.tag_ids))
            tags = session.exec(statement).all()
            db_task.tags.extend(tags)
            session.add(db_task)
            session.commit()
        
        return db_task

    def get_task_by_id(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Task]:
        """
        Retrieve a task by ID for a specific user
        """
        statement = select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
        task = session.exec(statement).first()
        return task

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
        Retrieve all tasks for a specific user with optional filters and pagination
        """
        from datetime import datetime
        statement = select(Task).where(Task.user_id == user_id)
        
        # Apply filters
        if status:
            statement = statement.where(Task.status == status)
        if priority:
            statement = statement.where(Task.priority == priority)
        if search:
            statement = statement.where(
                or_(
                    Task.title.contains(search),
                    Task.description.contains(search)
                )
            )
        
        # Apply date range filter
        if date_from:
            date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            statement = statement.where(Task.created_at >= date_from_obj)
        if date_to:
            date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            statement = statement.where(Task.created_at <= date_to_obj)
        
        # Apply filters
        if status:
            statement = statement.where(Task.status == status)
        if priority:
            statement = statement.where(Task.priority == priority)
        if search:
            statement = statement.where(
                or_(
                    Task.title.contains(search),
                    Task.description.contains(search)
                )
            )
        if tag_ids:
            # Join with the task-tag association table to filter by tags
            statement = statement.join(Task.tags).where(Tag.id.in_(tag_ids))

        # Apply sorting
        if sort_by == "due_date":
            if sort_order == "desc":
                statement = statement.order_by(Task.due_date.desc())
            else:
                statement = statement.order_by(Task.due_date.asc())
        elif sort_by == "priority":
            # Define custom ordering for priority: high, medium, low
            priority_order = case(
                (Task.priority == "high", 1),
                (Task.priority == "medium", 2),
                (Task.priority == "low", 3),
                else_=4
            )
            if sort_order == "desc":
                statement = statement.order_by(priority_order.desc(), Task.created_at.desc())
            else:
                statement = statement.order_by(priority_order.asc(), Task.created_at.asc())
        elif sort_by == "created_at":
            if sort_order == "desc":
                statement = statement.order_by(Task.created_at.desc())
            else:
                statement = statement.order_by(Task.created_at.asc())
        elif sort_by == "title":
            if sort_order == "desc":
                statement = statement.order_by(Task.title.desc())
            else:
                statement = statement.order_by(Task.title.asc())
        else:
            # Default sorting by creation date, newest first
            statement = statement.order_by(Task.created_at.desc())
        
        # Apply pagination
        statement = statement.offset(skip).limit(limit)
        
        tasks = session.exec(statement).all()
        return tasks

    def get_recurring_tasks_without_instances(self, session: Session) -> List[Task]:
        """
        Get recurring tasks that need new instances generated
        This is a simplified implementation - a full implementation would check
        which recurring tasks have instances that should be created based on their pattern
        """
        # For now, return all tasks with recurrence patterns
        statement = select(Task).where(Task.recurrence_pattern_id.is_not(None))
        tasks = session.exec(statement).all()
        return tasks

    def count_task_instances(self, session: Session, task_id: uuid.UUID) -> int:
        """
        Count the number of instances for a recurring task
        This is a simplified implementation - in a full implementation,
        this would count related recurring task instances
        """
        # For now, just return 1 for any task
        return 1

    def get_task_tag_ids(self, session: Session, task_id: uuid.UUID) -> List[uuid.UUID]:
        """
        Get the tag IDs associated with a task
        """
        task = self.get_task_by_id(session, task_id, task.user_id)
        if task:
            return [tag.id for tag in task.tags]
        return []

    def get_recurring_tasks_by_user(self, session: Session, user_id: uuid.UUID) -> List[Task]:
        """
        Get all recurring tasks for a specific user
        """
        statement = select(Task).where(
            and_(Task.user_id == user_id, Task.recurrence_pattern_id.is_not(None))
        )
        tasks = session.exec(statement).all()
        return tasks

    def update_task(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID, task_update: TaskUpdate) -> Optional[Task]:
        """
        Update a task's information
        """
        statement = select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
        db_task = session.exec(statement).first()

        if not db_task:
            return None

        # Update fields that are provided
        update_data = task_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field != "tag_ids":  # Handle tags separately
                setattr(db_task, field, value)

        # Update tags if provided
        if hasattr(task_update, 'tag_ids') and task_update.tag_ids is not None:
            # Clear existing tags
            db_task.tags.clear()
            
            # Add new tags
            if task_update.tag_ids:
                from sqlmodel import select
                tag_statement = select(Tag).where(Tag.id.in_(task_update.tag_ids))
                tags = session.exec(tag_statement).all()
                db_task.tags.extend(tags)

        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task

    def delete_task(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """
        Delete a task by ID for a specific user
        """
        statement = select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
        db_task = session.exec(statement).first()

        if not db_task:
            return False

        session.delete(db_task)
        session.commit()
        return True

    def mark_task_completed(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Task]:
        """
        Mark a task as completed
        """
        statement = select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
        db_task = session.exec(statement).first()

        if not db_task:
            return None

        db_task.status = "completed"
        db_task.completed_at = datetime.now()
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task

    def mark_task_incomplete(self, session: Session, task_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Task]:
        """
        Mark a task as incomplete
        """
        statement = select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
        db_task = session.exec(statement).first()

        if not db_task:
            return None

        db_task.status = "pending"
        db_task.completed_at = None
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task