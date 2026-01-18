from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database.session import get_db
from ..schemas.task import Task, TaskCreate, TaskUpdate, PaginatedTasks
from ..schemas.task import TaskToggleStatus
from ..services.task import get_tasks, get_task, create_task, update_task, delete_task, toggle_task_status
from ..api.deps import get_current_active_user


router = APIRouter()


@router.get("/", response_model=PaginatedTasks)
def read_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None),
    priority_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query("desc"),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve tasks with optional filtering, searching, and sorting
    """
    tasks, total = get_tasks(
        db, 
        current_user.id, 
        skip=skip, 
        limit=limit,
        status_filter=status_filter,
        priority_filter=priority_filter,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return {
        "tasks": tasks,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/", response_model=Task)
def create_new_task(
    task: TaskCreate,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task
    """
    return create_task(db, task, current_user.id)


@router.get("/{task_id}", response_model=Task)
def read_task(
    task_id: int,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific task by ID
    """
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    return task


@router.put("/{task_id}", response_model=Task)
def update_existing_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing task
    """
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this task")
    return update_task(db, task_id, task_update)


@router.delete("/{task_id}")
def delete_existing_task(
    task_id: int,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a task
    """
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
    delete_task(db, task_id)
    return {"message": "Task deleted successfully"}


@router.patch("/{task_id}/toggle-status", response_model=TaskToggleStatus)
def toggle_task_status_endpoint(
    task_id: int,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Toggle the status of a task between active and completed
    """
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this task")
    
    toggled_task = toggle_task_status(db, task_id)
    return TaskToggleStatus(
        id=toggled_task.id,
        status=toggled_task.status,
        completed_at=toggled_task.completed_at
    )