import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional
from backend.src.core.database import get_session
from backend.src.core.auth import get_current_active_user
from backend.src.core.rate_limiter import rate_limit_api
from backend.src.models.user import User
from backend.src.models.task import Task, TaskCreate, TaskUpdate
from backend.src.services.task_service import TaskService


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=Task)
@rate_limit_api
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the current user
    """
    # Ensure the task is created for the current user
    task_with_user = TaskCreate(
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        user_id=current_user.id,
        recurrence_pattern=task.recurrence_pattern,
        tag_ids=task.tag_ids
    )
    
    task_service = TaskService()
    db_task = task_service.create_task(session, task_with_user)
    return db_task


@router.get("/{task_id}", response_model=Task)
@rate_limit_api
def read_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific task by ID
    """
    task_service = TaskService()
    task = task_service.get_task_by_id(session, task_id, current_user.id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.get("/", response_model=List[Task])
@rate_limit_api
def read_tasks(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=1000),
    status: Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    sort_by: Optional[str] = Query(default=None),
    sort_order: Optional[str] = Query(default="asc"),
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    tag_ids: Optional[str] = Query(default=None)  # Comma-separated tag IDs as string
):
    # Convert comma-separated string to list of UUIDs if provided
    tag_uuids = None
    if tag_ids:
        try:
            tag_uuids = [uuid.UUID(tag_id.strip()) for tag_id in tag_ids.split(',')]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tag ID format"
            )
    """
    Get all tasks for the current user with optional filtering, sorting, and pagination
    """
    task_service = TaskService()
    tasks = task_service.get_tasks_by_user(
        session=session,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status,
        priority=priority,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        date_from=date_from,
        date_to=date_to,
        tag_ids=tag_uuids
    )
    return tasks


@router.put("/{task_id}", response_model=Task)
@rate_limit_api
def update_task(
    task_id: uuid.UUID,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Update a specific task by ID
    """
    task_service = TaskService()
    updated_task = task_service.update_task(
        session=session,
        task_id=task_id,
        user_id=current_user.id,
        task_update=task_update
    )
    
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return updated_task


@router.delete("/{task_id}")
@rate_limit_api
def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Delete a specific task by ID
    """
    task_service = TaskService()
    success = task_service.delete_task(
        session=session,
        task_id=task_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return {"message": "Task deleted successfully"}


@router.patch("/{task_id}/complete", response_model=Task)
@rate_limit_api
def mark_task_complete(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Mark a task as completed
    """
    task_service = TaskService()
    task = task_service.mark_task_completed(
        session=session,
        task_id=task_id,
        user_id=current_user.id
    )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.patch("/{task_id}/incomplete", response_model=Task)
@rate_limit_api
def mark_task_incomplete(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Mark a task as incomplete
    """
    task_service = TaskService()
    task = task_service.mark_task_incomplete(
        session=session,
        task_id=task_id,
        user_id=current_user.id
    )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task