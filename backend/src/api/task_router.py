from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from ..models.task import Task
from ..database.database import get_db
from ..services.task_service import TaskService, get_task_service
from ..services.auth_service import AuthService

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/")
async def get_tasks(
    status: str = Query(None, description="Filter by task status (active/completed)"),
    priority: str = Query(None, description="Filter by task priority (high/medium/low)"),
    search: str = Query(None, description="Search in task title or description"),
    sort_by: str = Query("created_at", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, le=1000, description="Maximum number of records to return"),
    current_user: dict = Depends(AuthService.get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    """Retrieve all tasks for the current user with optional filtering and sorting."""
    tasks = task_service.get_tasks(
        user_id=current_user.id,
        status=status,
        priority=priority,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit
    )
    return {"tasks": tasks, "total": len(tasks)}


@router.post("/")
async def create_task(
    title: str,
    description: str = None,
    priority: str = Query("medium", description="Task priority (high/medium/low)"),
    due_date: str = None,  # Will be parsed to datetime
    recurrence_pattern_id: int = None,
    tag_ids: List[int] = Query([], description="List of tag IDs to associate with the task"),
    current_user: dict = Depends(AuthService.get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    """Create a new task for the current user."""
    # Parse due_date if provided
    due_date_obj = None
    if due_date:
        try:
            due_date_obj = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use ISO format."
            )
    
    try:
        task = task_service.create_task(
            title=title,
            description=description,
            priority=priority,
            due_date=due_date_obj,
            user_id=current_user.id,
            recurrence_pattern_id=recurrence_pattern_id,
            tag_ids=tag_ids
        )
        return task
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{task_id}")
async def get_task(
    task_id: int,
    current_user: dict = Depends(AuthService.get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    """Get a specific task by ID."""
    task = task_service.get_task_by_id(task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.put("/{task_id}")
async def update_task(
    task_id: int,
    title: str = None,
    description: str = None,
    status: str = None,
    priority: str = None,
    due_date: str = None,
    recurrence_pattern_id: int = None,
    tag_ids: List[int] = Query([], description="List of tag IDs to associate with the task"),
    current_user: dict = Depends(AuthService.get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    """Update an existing task."""
    # Parse due_date if provided
    due_date_obj = None
    if due_date:
        try:
            due_date_obj = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use ISO format."
            )
    
    updated_task = task_service.update_task(
        task_id=task_id,
        user_id=current_user.id,
        title=title,
        description=description,
        status=status,
        priority=priority,
        due_date=due_date_obj,
        recurrence_pattern_id=recurrence_pattern_id,
        tag_ids=tag_ids
    )
    
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return updated_task


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: dict = Depends(AuthService.get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    """Delete a task."""
    success = task_service.delete_task(task_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return {"message": "Task deleted successfully"}


@router.patch("/{task_id}/toggle-complete")
async def toggle_task_completion(
    task_id: int,
    current_user: dict = Depends(AuthService.get_current_user),
    task_service: TaskService = Depends(get_task_service)
):
    """Toggle the completion status of a task."""
    task = task_service.toggle_task_completion(task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task