from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Table
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid

Base = declarative_base()

# Association table for many-to-many relationship between Task and Tag
task_tags = Table(
    'task_tags',
    Base.metadata,
    Column('task_id', String, ForeignKey('tasks.id')),
    Column('tag_id', String, ForeignKey('tags.id'))
)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    theme_preference = Column(String, default="auto")  # light, dark, auto

    # Relationship
    tasks = relationship("Task", back_populates="owner")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="active")  # active, completed
    priority = Column(String, default="medium")  # high, medium, low
    due_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)
    recurrence_pattern = Column(String)  # daily, weekly, monthly
    recurrence_end_date = Column(DateTime)
    version = Column(Integer, default=1)  # For optimistic locking
    
    # Foreign key
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relationship
    owner = relationship("User", back_populates="tasks")
    tags = relationship("Tag", secondary=task_tags, back_populates="tasks")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    color = Column(String)  # hex color code
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign key
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relationship
    tasks = relationship("Task", secondary=task_tags, back_populates="tags")