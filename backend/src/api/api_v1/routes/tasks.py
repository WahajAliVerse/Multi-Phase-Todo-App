from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....database.session import get_db
from ....api.deps import get_current_user
from ....schemas.task import Task, TaskCreate, TaskUpdate, PaginatedTasks
from ....models.user import User
from ....models.task import Task as TaskModel
from ....services.task_service import TaskService


router = APIRouter()


@router.get("/", response_model=PaginatedTasks)
def read_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """
    Retrieve tasks with optional filtering, pagination, and search.
    """
    tasks, total = TaskService.get_tasks(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status,
        priority=priority,
        search=search
    )
    return {
        "tasks": tasks,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/", response_model=Task)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Create a new task.
    """
    return TaskService.create_task(
        db=db,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        recurrence_pattern=task.recurrence_pattern,
        user_id=current_user.id,
        tag_ids=task.tag_ids
    )


@router.get("/{task_id}", response_model=Task)
def read_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get a specific task by ID.
    """
    task = TaskService.get_task_by_id(db, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=Task)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update a specific task by ID.
    """
    task = TaskService.update_task(
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
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Delete a specific task by ID.
    """
    task = TaskService.get_task_by_id(db, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    success = TaskService.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


@router.patch("/{task_id}/toggle-status", response_model=Task)
def toggle_task_status(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Toggle the status of a task between active and completed.
    """
    task = TaskService.toggle_task_status(db, task_id)
    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task