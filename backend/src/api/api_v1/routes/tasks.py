from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from models.task import Task as TaskModel
from models.user import User as UserModel
from schemas.task import Task as TaskSchema, TaskCreate, TaskUpdate, PaginatedTasks
from database.session import get_db
from api.deps import get_current_user
from services import task as task_service

router = APIRouter()

@router.get("/", response_model=PaginatedTasks)
def read_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query("desc"),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks, total = task_service.get_tasks(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status,
        priority=priority,
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

@router.post("/", response_model=TaskSchema)
def create_task(
    task: TaskCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return task_service.create_task(db=db, task=task, user_id=current_user.id)

@router.get("/{task_id}", response_model=TaskSchema)
def read_task(
    task_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = task_service.get_task_by_id_and_user(db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskSchema)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = task_service.update_task(db=db, task_id=task_id, task_update=task_update, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = task_service.delete_task(db=db, task_id=task_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

@router.patch("/{task_id}/toggle-status", response_model=TaskSchema)
def toggle_task_status(
    task_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = task_service.toggle_task_status(db=db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task