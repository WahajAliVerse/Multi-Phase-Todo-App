"""
Task API routes for the todo application.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from src.database.session import get_db
from src.auth.dependencies import get_current_user
from src.schemas.task import TaskSchema, TaskCreateSchema, TaskUpdateSchema, TaskStatus, TaskPriority
from src.models.user import User
from src.services.task_service import (
    create_task, get_task, get_tasks, update_task, delete_task, toggle_task_status
)

router = APIRouter()


@router.get("/", response_model=List[TaskSchema])
def read_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    status_param: Optional[TaskStatus] = Query(None, alias="status"),
    priority: Optional[TaskPriority] = Query(None),
    search: Optional[str] = Query(None)
):
    """
    Get all tasks for the current user with optional filters.
    """
    tasks = get_tasks(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status_param,
        priority=priority,
        search=search
    )
    return tasks


@router.get("/{task_id}", response_model=TaskSchema)
def read_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get a specific task.
    """
    task = get_task(db, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", response_model=TaskSchema)
def create_new_task(
    task_data: TaskCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task.
    """
    task = create_task(
        db=db,
        title=task_data.title,
        description=task_data.description,
        user_id=current_user.id,
        priority=task_data.priority,
        due_date=task_data.due_date,
        tag_ids=task_data.tag_ids
    )
    return task


@router.put("/{task_id}", response_model=TaskSchema)
def update_existing_task(
    task_id: int,
    task_update: TaskUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing task.
    """
    task = update_task(
        db=db,
        task_id=task_id,
        title=task_update.title,
        description=task_update.description,
        status=task_update.status,
        priority=task_update.priority,
        due_date=task_update.due_date,
        tag_ids=task_update.tag_ids
    )

    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.delete("/{task_id}")
def delete_existing_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Delete a task.
    """
    task = get_task(db, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    success = delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"message": "Task deleted successfully"}


@router.patch("/{task_id}/toggle-status", response_model=TaskSchema)
def toggle_task_completion_status(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Toggle task status between active and completed.
    """
    task = toggle_task_status(db, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    return task