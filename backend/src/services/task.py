from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from datetime import datetime
from typing import List, Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.task import Task
from models.tag import Tag
from models.recurrence_pattern import RecurrencePattern
from schemas.task import TaskCreate, TaskUpdate
from schemas.recurrence_pattern import RecurrencePatternCreate


def get_task(db: Session, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100,
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "desc"
):
    query = db.query(Task).filter(Task.user_id == user_id)
    
    # Apply filters
    if status_filter:
        query = query.filter(Task.status == status_filter)
    
    if priority_filter:
        query = query.filter(Task.priority == priority_filter)
    
    if search:
        query = query.filter(
            or_(
                Task.title.contains(search),
                Task.description.contains(search)
            )
        )
    
    # Apply sorting
    if sort_by == "created_at":
        query = query.order_by(Task.created_at.desc() if sort_order == "desc" else Task.created_at.asc())
    elif sort_by == "due_date":
        query = query.order_by(Task.due_date.desc() if sort_order == "desc" else Task.due_date.asc())
    elif sort_by == "priority":
        query = query.order_by(Task.priority.desc() if sort_order == "desc" else Task.priority.asc())
    elif sort_by == "title":
        query = query.order_by(Task.title.desc() if sort_order == "desc" else Task.title.asc())
    else:
        # Default sorting by creation date
        query = query.order_by(Task.created_at.desc())
    
    tasks = query.offset(skip).limit(limit).all()
    
    # Get total count for pagination
    total_query = db.query(Task).filter(Task.user_id == user_id)
    if status_filter:
        total_query = total_query.filter(Task.status == status_filter)
    if priority_filter:
        total_query = total_query.filter(Task.priority == priority_filter)
    if search:
        total_query = total_query.filter(
            or_(
                Task.title.contains(search),
                Task.description.contains(search)
            )
        )
    total = total_query.count()
    
    return tasks, total


def create_task(db: Session, task: TaskCreate, user_id: int):
    # Create the task
    db_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date,
        status=task.status,
        user_id=user_id
    )
    
    # Add tags if provided
    if task.tags:
        for tag_name in task.tags:
            # Check if tag already exists for this user
            existing_tag = db.query(Tag).filter(
                and_(Tag.name == tag_name, Tag.user_id == user_id)
            ).first()
            
            if not existing_tag:
                # Create new tag
                tag = Tag(name=tag_name, user_id=user_id)
                db.add(tag)
                db.flush()  # Get the ID for the new tag
                db_task.tags.append(tag)
            else:
                # Use existing tag
                db_task.tags.append(existing_tag)
    
    # Add recurrence pattern if provided
    if task.recurrence_pattern:
        recurrence = RecurrencePattern(
            pattern_type=task.recurrence_pattern.pattern_type,
            interval=task.recurrence_pattern.interval,
            end_date=task.recurrence_pattern.end_date,
            occurrences_count=task.recurrence_pattern.occurrences_count,
            user_id=user_id
        )
        db.add(recurrence)
        db.flush()  # Get the ID for the new recurrence pattern
        db_task.recurrence_pattern = recurrence
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task_update: TaskUpdate):
    db_task = get_task(db, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update fields if provided
    if task_update.title is not None:
        db_task.title = task_update.title
    if task_update.description is not None:
        db_task.description = task_update.description
    if task_update.priority is not None:
        db_task.priority = task_update.priority
    if task_update.due_date is not None:
        db_task.due_date = task_update.due_date
    if task_update.status is not None:
        db_task.status = task_update.status
        if task_update.status == "completed" and not db_task.completed_at:
            db_task.completed_at = datetime.utcnow()
        elif task_update.status == "active":
            db_task.completed_at = None
    
    # Update tags if provided
    if task_update.tags is not None:
        # Clear existing tags
        db_task.tags.clear()
        
        # Add new tags
        for tag_name in task_update.tags:
            # Check if tag already exists for this user
            existing_tag = db.query(Tag).filter(
                and_(Tag.name == tag_name, Tag.user_id == db_task.user_id)
            ).first()
            
            if not existing_tag:
                # Create new tag
                tag = Tag(name=tag_name, user_id=db_task.user_id)
                db.add(tag)
                db.flush()  # Get the ID for the new tag
                db_task.tags.append(tag)
            else:
                # Use existing tag
                db_task.tags.append(existing_tag)
    
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(db_task)
    db.commit()
    return db_task


def toggle_task_status(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if db_task.status == "active":
        db_task.status = "completed"
        db_task.completed_at = datetime.utcnow()
    else:
        db_task.status = "active"
        db_task.completed_at = None
    
    db.commit()
    db.refresh(db_task)
    return db_task