"""
TaskTag association model for the todo application.
"""

from sqlalchemy import Column, Integer, ForeignKey
from src.database.base import Base


class TaskTag(Base):
    __tablename__ = "task_tags"

    task_id = Column(Integer, ForeignKey("tasks.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)