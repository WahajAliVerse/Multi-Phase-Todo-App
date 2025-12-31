from typing import List, Optional
from models.task import Task
from exceptions import TaskNotFoundError, InvalidTaskError
from utils.validators import validate_task_title, validate_task_description, validate_task_id
from storage.storage_interface import StorageInterface


class InMemoryStorage(StorageInterface):
    def __init__(self):
        """Initialize in-memory storage"""
        self.tasks = {}  # Dictionary to store tasks by ID
        self.next_id = 1  # Counter for generating unique IDs

    def add_task(self, title: str, description: str = "") -> Task:
        """Add a new task to storage and return the created task"""
        # Validate inputs
        if not validate_task_title(title):
            raise InvalidTaskError(f"Invalid task title: '{title}'. Title must be 1-255 characters.")
        
        if not validate_task_description(description):
            raise InvalidTaskError(f"Invalid task description. Description must be <= 1000 characters.")
        
        # Create task with auto-incrementing ID
        task = Task(id=self.next_id, title=title, description=description, completed=False)
        self.tasks[self.next_id] = task
        self.next_id += 1
        
        return task

    def get_task(self, task_id: int) -> Optional[Task]:
        """Retrieve a task by its ID"""
        if not validate_task_id(task_id):
            raise InvalidTaskError(f"Invalid task ID: {task_id}")
        
        if task_id not in self.tasks:
            raise TaskNotFoundError(f"Task with ID {task_id} not found")
        
        return self.tasks[task_id]

    def get_all_tasks(self) -> List[Task]:
        """Retrieve all tasks"""
        return list(self.tasks.values())

    def update_task(self, task_id: int, title: str = None, description: str = None) -> bool:
        """Update task details by ID, return True if successful"""
        if not validate_task_id(task_id):
            raise InvalidTaskError(f"Invalid task ID: {task_id}")
        
        if task_id not in self.tasks:
            raise TaskNotFoundError(f"Task with ID {task_id} not found")
        
        task = self.tasks[task_id]
        
        # Update title if provided and valid
        if title is not None:
            if not validate_task_title(title):
                raise InvalidTaskError(f"Invalid task title: '{title}'. Title must be 1-255 characters.")
            task.title = title
        
        # Update description if provided and valid
        if description is not None:
            if not validate_task_description(description):
                raise InvalidTaskError(f"Invalid task description. Description must be <= 1000 characters.")
            task.description = description
        
        return True

    def delete_task(self, task_id: int) -> bool:
        """Delete a task by ID, return True if successful"""
        if not validate_task_id(task_id):
            raise InvalidTaskError(f"Invalid task ID: {task_id}")
        
        if task_id not in self.tasks:
            raise TaskNotFoundError(f"Task with ID {task_id} not found")
        
        del self.tasks[task_id]
        return True

    def mark_task_complete(self, task_id: int) -> bool:
        """Mark a task as complete by ID, return True if successful"""
        if not validate_task_id(task_id):
            raise InvalidTaskError(f"Invalid task ID: {task_id}")
        
        if task_id not in self.tasks:
            raise TaskNotFoundError(f"Task with ID {task_id} not found")
        
        self.tasks[task_id].completed = True
        return True

    def mark_task_incomplete(self, task_id: int) -> bool:
        """Mark a task as incomplete by ID, return True if successful"""
        if not validate_task_id(task_id):
            raise InvalidTaskError(f"Invalid task ID: {task_id}")
        
        if task_id not in self.tasks:
            raise TaskNotFoundError(f"Task with ID {task_id} not found")
        
        self.tasks[task_id].completed = False
        return True