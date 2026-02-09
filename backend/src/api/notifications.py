from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlmodel import Session
from typing import List, Optional
import uuid
from src.core.database import get_session
from src.core.auth import get_current_active_user
from src.core.rate_limiter import rate_limit_api
from src.models.user import User
from src.models.notification import Notification, NotificationCreate, NotificationUpdate
from src.services.notification_service import NotificationService


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/", response_model=Notification)
@rate_limit_api
def create_notification(
    request: Request,
    notification_create: NotificationCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Create a new notification
    """
    # Ensure the notification is for the current user
    if notification_create.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create notification for another user"
        )
    
    notification_service = NotificationService()
    db_notification = notification_service.create_notification(session, notification_create)
    return db_notification


@router.get("/", response_model=List[Notification])
@rate_limit_api
def read_notifications(
    request: Request,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=1000),
    status: Optional[str] = Query(default=None),
    type: Optional[str] = Query(default=None),
    unread_only: bool = Query(default=False)
):
    """
    Get all notifications for the current user with optional filtering and pagination
    """
    notification_service = NotificationService()
    notifications = notification_service.get_notifications_by_user(
        session=session,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status,
        type=type,
        unread_only=unread_only
    )
    return notifications


@router.get("/pending", response_model=List[Notification])
@rate_limit_api
def read_pending_notifications(
    request: Request,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Get all pending notifications for the current user
    """
    notification_service = NotificationService()
    notifications = notification_service.get_pending_notifications(
        session=session,
        user_id=current_user.id
    )
    return notifications


@router.get("/{notification_id}", response_model=Notification)
@rate_limit_api
def read_notification(
    request: Request,
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific notification by ID
    """
    notification_service = NotificationService()
    notification = notification_service.get_notification_by_id(
        session=session,
        notification_id=notification_id,
        user_id=current_user.id
    )
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return notification


@router.put("/{notification_id}", response_model=Notification)
@rate_limit_api
def update_notification(
    request: Request,
    notification_id: uuid.UUID,
    notification_update: NotificationUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Update a notification's information
    """
    notification_service = NotificationService()
    updated_notification = notification_service.update_notification(
        session=session,
        notification_id=notification_id,
        user_id=current_user.id,
        notification_update=notification_update
    )
    
    if not updated_notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return updated_notification


@router.patch("/{notification_id}/read", response_model=Notification)
@rate_limit_api
def mark_notification_as_read(
    request: Request,
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Mark a notification as read
    """
    notification_service = NotificationService()
    notification = notification_service.mark_notification_as_read(
        session=session,
        notification_id=notification_id,
        user_id=current_user.id
    )
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return notification


@router.delete("/{notification_id}")
@rate_limit_api
def delete_notification(
    request: Request,
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Delete a notification
    """
    notification_service = NotificationService()
    success = notification_service.delete_notification(
        session=session,
        notification_id=notification_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification deleted successfully"}


@router.post("/settings")
@rate_limit_api
def update_notification_settings(
    request: Request,
    settings: dict,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Update user's notification preferences
    """
    from src.services.user_service import UserService

    user_service = UserService()
    updated_user = user_service.update_notification_settings(
        session=session,
        user_id=current_user.id,
        settings=settings
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Notification settings updated successfully", "settings": updated_user.notification_settings}


@router.get("/reminders/upcoming", response_model=List[Notification])
@rate_limit_api
def get_upcoming_reminders(
    request: Request,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Get upcoming reminders for the current user
    """
    notification_service = NotificationService()
    upcoming_reminders = notification_service.get_upcoming_reminders(
        session=session,
        user_id=current_user.id
    )
    return upcoming_reminders


@router.get("/settings")
@rate_limit_api
def get_notification_settings(
    request: Request,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Get user's notification preferences
    """
    from src.services.user_service import UserService

    user_service = UserService()
    user = user_service.get_user_by_id(session, current_user.id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {"settings": user.notification_settings}