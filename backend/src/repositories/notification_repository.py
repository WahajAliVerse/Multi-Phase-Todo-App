from typing import Optional, List
from sqlmodel import Session, select, and_
from backend.src.models.notification import Notification, NotificationCreate, NotificationUpdate


class NotificationRepository:
    def create_notification(self, session: Session, notification_create: NotificationCreate) -> Notification:
        """
        Create a new notification in the database
        """
        from datetime import datetime
        db_notification = Notification(
            type=notification_create.type,
            title=notification_create.title,
            message=notification_create.message,
            user_id=notification_create.user_id,
            task_id=notification_create.task_id,
            status="sent",  # Default to sent when created
            sent_at=datetime.now()  # Set sent time to now when created
        )
        session.add(db_notification)
        session.commit()
        session.refresh(db_notification)
        return db_notification

    def get_notification_by_id(self, session: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Notification]:
        """
        Retrieve a notification by ID for a specific user
        """
        statement = select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        )
        notification = session.exec(statement).first()
        return notification

    def get_notifications_by_user(
        self, 
        session: Session, 
        user_id: uuid.UUID, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None,
        type: Optional[str] = None,
        unread_only: bool = False
    ) -> List[Notification]:
        """
        Retrieve all notifications for a specific user with optional filters and pagination
        """
        statement = select(Notification).where(Notification.user_id == user_id)
        
        # Apply filters
        if status:
            statement = statement.where(Notification.status == status)
        if type:
            statement = statement.where(Notification.type == type)
        if unread_only:
            statement = statement.where(Notification.read_at.is_(None))
        
        # Apply sorting (newest first)
        statement = statement.order_by(Notification.created_at.desc())
        
        # Apply pagination
        statement = statement.offset(skip).limit(limit)
        
        notifications = session.exec(statement).all()
        return notifications

    def get_pending_notifications(self, session: Session, user_id: uuid.UUID) -> List[Notification]:
        """
        Retrieve all pending notifications for a specific user
        """
        statement = select(Notification).where(
            and_(
                Notification.user_id == user_id,
                Notification.status.in_(["sent", "delivered"])  # Notifications that haven't been read yet
            )
        ).order_by(Notification.created_at.desc())
        
        notifications = session.exec(statement).all()
        return notifications

    def update_notification(self, session: Session, notification_id: uuid.UUID, user_id: uuid.UUID, notification_update: NotificationUpdate) -> Optional[Notification]:
        """
        Update a notification's information
        """
        statement = select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        )
        db_notification = session.exec(statement).first()

        if not db_notification:
            return None

        # Update fields that are provided
        update_data = notification_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_notification, field, value)

        # If status is being updated to 'read', set read_at timestamp
        if notification_update.status == "read" and not db_notification.read_at:
            from datetime import datetime
            db_notification.read_at = datetime.now()

        session.add(db_notification)
        session.commit()
        session.refresh(db_notification)
        return db_notification

    def mark_notification_as_read(self, session: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Notification]:
        """
        Mark a notification as read
        """
        statement = select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        )
        db_notification = session.exec(statement).first()

        if not db_notification:
            return None

        from datetime import datetime
        db_notification.status = "read"
        db_notification.read_at = datetime.now()

        session.add(db_notification)
        session.commit()
        session.refresh(db_notification)
        return db_notification

    def delete_notification(self, session: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """
        Delete a notification by ID for a specific user
        """
        statement = select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        )
        db_notification = session.exec(statement).first()

        if not db_notification:
            return False

        session.delete(db_notification)
        session.commit()
        return True