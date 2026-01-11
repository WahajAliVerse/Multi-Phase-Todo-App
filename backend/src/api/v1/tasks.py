from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database.session import get_db
from ..models.task import Task
from ..services.task_service import TaskService
from ..api.deps import get_current_user
from ..core.exceptions import TaskNotFoundException

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("/", response_model=List[Task])
def get_tasks(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    order: Optional[str] = Query('asc'),
    limit: Optional[int] = Query(50),
    offset: Optional[int] = Query(0),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Retrieve tasks for the current user with optional filters
    """
    return TaskService.get_tasks(
        db=db,
        user_id=current_user.id,
        status=status,
        priority=priority,
        search=search,
        sort=sort,
        order=order,
        limit=limit,
        offset=offset
    )

@router.post("/", response_model=Task)
def create_task(
    task_data: dict,  # Using dict temporarily until we define Pydantic models
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new task for the current user
    """
    return TaskService.create_task(
        db=db,
        title=task_data.get("title"),
        description=task_data.get("description"),
        priority=task_data.get("priority", "medium"),
        due_date=task_data.get("due_date"),
        user_id=current_user.id,
        tags=task_data.get("tags"),
        recurrence_pattern=task_data.get("recurrence_pattern")
    )

@router.get("/{task_id}", response_model=Task)
def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Retrieve a specific task by ID
    """
    try:
        return TaskService.get_task_by_id(db=db, task_id=task_id, user_id=current_user.id)
    except TaskNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )

@router.put("/{task_id}", response_model=Task)
def update_task(
    task_id: str,
    task_data: dict,  # Using dict temporarily until we define Pydantic models
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update a specific task by ID
    """
    try:
        return TaskService.update_task(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            title=task_data.get("title"),
            description=task_data.get("description"),
            priority=task_data.get("priority"),
            due_date=task_data.get("due_date"),
            status=task_data.get("status"),
            tags=task_data.get("tags"),
            version=task_data.get("version")  # For optimistic locking
        )
    except TaskNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )

@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    version: Optional[int] = Query(None),  # For optimistic locking
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete a specific task by ID
    """
    try:
        success = TaskService.delete_task(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            version=version
        )
        if success:
            return {"message": "Task deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete task"
            )
    except TaskNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )

@router.post("/{task_id}/complete", response_model=Task)
def mark_task_complete(
    task_id: str,
    version: Optional[int] = Query(None),  # For optimistic locking
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Mark a task as complete
    """
    try:
        return TaskService.mark_task_complete(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            version=version
        )
    except TaskNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )

@router.post("/{task_id}/reopen", response_model=Task)
def reopen_task(
    task_id: str,
    version: Optional[int] = Query(None),  # For optimistic locking
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Reopen a completed task
    """
    try:
        return TaskService.reopen_task(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            version=version
        )
    except TaskNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )