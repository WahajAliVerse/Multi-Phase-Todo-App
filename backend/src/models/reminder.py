from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..database.database import Base

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    delivery_status = Column(String(20), default='pending')  # 'pending', 'sent', 'delivered', 'failed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime, nullable=True)