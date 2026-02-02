from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from ..models.reminder import Reminder
from ..database.database import get_db
from ..services.reminder_service import ReminderService, get_reminder_service
from ..services.auth_service import AuthService

router = APIRouter(prefix="/reminders", tags=["reminders"])

@router.get("/")
async def get_reminders(
    current_user: dict = Depends(AuthService.get_current_user),
    reminder_service: ReminderService = Depends(get_reminder_service)
):
    """Retrieve all reminders for tasks belonging to the current user."""
    reminders = reminder_service.get_reminders_by_user(current_user.id)
    return {"reminders": reminders}


@router.post("/")
async def create_reminder(
    task_id: int,
    scheduled_time: str,
    current_user: dict = Depends(AuthService.get_current_user),
    reminder_service: ReminderService = Depends(get_reminder_service)
):
    """Create a new reminder for a task."""
    try:
        # Parse scheduled_time to datetime
        scheduled_datetime = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use ISO format."
        )
    
    try:
        reminder = reminder_service.create_reminder(
            task_id=task_id,
            scheduled_time=scheduled_datetime,
            user_id=current_user.id
        )
        return reminder
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{reminder_id}")
async def get_reminder(
    reminder_id: int,
    current_user: dict = Depends(AuthService.get_current_user),
    reminder_service: ReminderService = Depends(get_reminder_service)
):
    """Get a specific reminder by ID."""
    reminder = reminder_service.get_reminder_by_id(reminder_id, current_user.id)
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    return reminder


@router.put("/{reminder_id}")
async def update_reminder(
    reminder_id: int,
    scheduled_time: str = None,
    delivery_status: str = None,
    current_user: dict = Depends(AuthService.get_current_user),
    reminder_service: ReminderService = Depends(get_reminder_service)
):
    """Update an existing reminder."""
    try:
        # Parse scheduled_time if provided
        scheduled_datetime = None
        if scheduled_time:
            scheduled_datetime = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use ISO format."
        )
    
    try:
        updated_reminder = reminder_service.update_reminder(
            reminder_id=reminder_id,
            user_id=current_user.id,
            scheduled_time=scheduled_datetime,
            delivery_status=delivery_status
        )
        
        if not updated_reminder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reminder not found"
            )
        
        return updated_reminder
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: int,
    current_user: dict = Depends(AuthService.get_current_user),
    reminder_service: ReminderService = Depends(get_reminder_service)
):
    """Delete a reminder."""
    success = reminder_service.delete_reminder(reminder_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    return {"message": "Reminder deleted successfully"}