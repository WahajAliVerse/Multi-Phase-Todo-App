from abc import ABC, abstractmethod
from typing import List, Optional
from models.task import Task


class StorageInterface(ABC):
    """Abstract base class for storage implementations."""
    
    @abstractmethod
    def add_task(self, title: str, description: str = "") -> Task:
        """Add a new task to storage and return the created task"""
        pass

    @abstractmethod
    def get_task(self, task_id: int) -> Optional[Task]:
        """Retrieve a task by its ID"""
        pass

    @abstractmethod
    def get_all_tasks(self) -> List[Task]:
        """Retrieve all tasks"""
        pass

    @abstractmethod
    def update_task(self, task_id: int, title: str = None, description: str = None) -> bool:
        """Update task details by ID, return True if successful"""
        pass

    @abstractmethod
    def delete_task(self, task_id: int) -> bool:
        """Delete a task by ID, return True if successful"""
        pass

    @abstractmethod
    def mark_task_complete(self, task_id: int) -> bool:
        """Mark a task as complete by ID, return True if successful"""
        pass

    @abstractmethod
    def mark_task_incomplete(self, task_id: int) -> bool:
        """Mark a task as incomplete by ID, return True if successful"""
        pass