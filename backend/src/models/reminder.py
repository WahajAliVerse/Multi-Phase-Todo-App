from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database.base import Base
from enum import Enum as PyEnum


class ReminderDeliveryStatus(PyEnum):
    pending = "pending"
    sent = "sent"
    missed = "missed"


class ReminderNotificationType(PyEnum):
    email = "email"
    push = "push"
    in_app = "in_app"


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    delivery_status = Column(Enum(ReminderDeliveryStatus), default=ReminderDeliveryStatus.pending)
    notification_type = Column(Enum(ReminderNotificationType), default=ReminderNotificationType.in_app)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    task = relationship("Task", back_populates="reminders")