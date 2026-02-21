"""
Task Management Tools

Wrappers for backend task API endpoints using OpenAI Agents SDK function tools.
When running inside the backend, uses service layer directly.
When running standalone, uses HTTP API calls.
"""

import httpx
from typing import Optional, List, Dict, Any
from agents import function_tool
from pydantic import BaseModel, Field
import os

# Try to import backend services (when running inside backend)
try:
    # Running inside backend - use service layer directly
    import sys
    from pathlib import Path
    BACKEND_ROOT = Path(__file__).parent.parent.parent.parent / "backend" / "todo-backend"
    sys.path.insert(0, str(BACKEND_ROOT))
    
    from src.services.task_service import TaskService
    from src.models.task import TaskCreate, TaskUpdate
    from src.core.database import get_session
    from sqlmodel import Session
    BACKEND_AVAILABLE = True
except ImportError:
    # Running standalone - use HTTP API
    BACKEND_AVAILABLE = False
    TaskService = None  # type: ignore
    TaskCreate = None  # type: ignore
    TaskUpdate = None  # type: ignore
    get_session = None  # type: ignore
    Session = None  # type: ignore

# Import agent config (handle both relative and absolute imports)
try:
    from ..config import BACKEND_API_URL, logger
    from ..logger import agent_logger, log_tool_execution
    from ..error_handler import (
        ToolExecutionError,
        BackendError,
        retry_with_backoff,
        handle_llm_errors,
    )
except ImportError:
    # Fallback for direct module execution
    from agent.config import BACKEND_API_URL, logger  # type: ignore
    from agent.logger import agent_logger, log_tool_execution  # type: ignore
    from agent.error_handler import (  # type: ignore
        ToolExecutionError,
        BackendError,
        retry_with_backoff,
        handle_llm_errors,
    )


# HTTP client for backend API calls (fallback)
http_client = httpx.AsyncClient(timeout=30.0)

# Thread-local storage for current user and session
import threading
_current_user_id = threading.local()
_current_session = threading.local()


def set_current_user_id(user_id: str):
    """Set current user ID for tool execution context."""
    _current_user_id.value = user_id


def get_current_user_id() -> Optional[str]:
    """Get current user ID from tool execution context."""
    return getattr(_current_user_id, 'value', None)


def set_current_session(session: Session):
    """Set current database session for tool execution context."""
    _current_session.value = session


def get_current_session() -> Optional[Session]:
    """Get current database session from tool execution context."""
    return getattr(_current_session, 'value', None)


@function_tool
async def create_task(
    title: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: str = "medium",
    tags: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Create a new task in the todo app.

    Args:
        title: Task title (required, max 200 chars)
        description: Task description (optional, max 1000 chars)
        due_date: Due date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
        priority: Task priority: low, medium, or high
        tags: List of tag UUIDs to assign

    Returns:
        Dictionary with success status, task_id, and task details
    """
    import time
    import uuid
    start_time = time.time()

    try:
        agent_logger.info(f"Creating task: '{title}'")

        # Use backend service layer if available
        if BACKEND_AVAILABLE and TaskService and TaskCreate:
            # Get current session and user from context
            session = get_current_session()
            user_id_str = get_current_user_id()
            
            if session and user_id_str:
                try:
                    user_id = uuid.UUID(user_id_str)
                    task_service = TaskService()
                    
                    # Create task using service layer
                    task_create = TaskCreate(
                        title=title,
                        description=description,
                        due_date=due_date,
                        priority=priority,
                        tag_ids=tags or [],
                    )
                    
                    db_task = task_service.create_task(session, task_create, )
                    task_data = db_task.model_dump() if hasattr(db_task, 'model_dump') else db_task.__dict__
                    
                    duration_ms = int((time.time() - start_time) * 1000)
                    log_tool_execution("create_task", "success", duration_ms, {"task_id": task_data.get("id")})
                    
                    return {
                        "success": True,
                        "task_id": str(task_data.get("id")),
                        "task": task_data,
                    }
                except Exception as service_error:
                    agent_logger.error(f"Service layer error: {service_error}")
                    # Fall through to HTTP API
                    pass
        
        # Fallback: Call backend API via HTTP
        payload = {
            "title": title,
            "description": description,
            "due_date": due_date,
            "priority": priority,
            "tags": tags or [],
        }

        # Remove None values
        payload = {k: v for k, v in payload.items() if v is not None}

        response = await http_client.post(
            f"{BACKEND_API_URL}/tasks",
            json=payload,
        )

        if response.status_code not in [200, 201]:
            raise BackendError(
                f"Failed to create task: {response.text}",
                status_code=response.status_code
            )

        task_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)

        log_tool_execution("create_task", "success", duration_ms, {"task_id": task_data.get("id")})

        return {
            "success": True,
            "task_id": task_data.get("id"),
            "task": task_data,
        }

    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_task", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("create_task", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_task", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_task", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("create_task", str(e))


@function_tool
async def get_tasks(
    status: Optional[str] = "all",
    priority: Optional[str] = "all",
    tag_ids: Optional[List[str]] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
) -> Dict[str, Any]:
    """
    Retrieve tasks with optional filtering.

    Args:
        status: Filter by status: all, active, or completed
        priority: Filter by priority: all, low, medium, or high
        tag_ids: Filter by tag IDs
        search: Search in title/description
        date_from: Filter tasks from this date (ISO format)
        date_to: Filter tasks until this date (ISO format)
    
    Returns:
        Dictionary with success status, tasks list, and count
    """
    import time
    start_time = time.time()
    
    try:
        # Build query parameters
        params = {}
        if status and status != "all":
            params["status"] = status
        if priority and priority != "all":
            params["priority"] = priority
        if tag_ids:
            params["tag_ids"] = tag_ids
        if search:
            params["search"] = search
        if date_from:
            params["date_from"] = date_from
        if date_to:
            params["date_to"] = date_to
        
        # Call backend API
        response = await http_client.get(
            f"{BACKEND_API_URL}/tasks",
            params=params,
        )
        
        if response.status_code != 200:
            raise BackendError(
                f"Failed to get tasks: {response.text}",
                status_code=response.status_code
            )
        
        tasks_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)
        
        # Ensure tasks is a list
        tasks = tasks_data if isinstance(tasks_data, list) else tasks_data.get("tasks", [])
        
        log_tool_execution("get_tasks", "success", duration_ms, {"count": len(tasks)})
        
        return {
            "success": True,
            "tasks": tasks,
            "count": len(tasks),
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("get_tasks", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("get_tasks", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("get_tasks", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("get_tasks", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("get_tasks", str(e))


@function_tool
async def update_task(
    task_id: str,
    updates: object
) -> Dict[str, Any]:
    """
    Update an existing task.

    Args:
        task_id: Task UUID to update
        updates: Fields to update: title, description, due_date, priority, status
    
    Returns:
        Dictionary with success status and updated task
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Updating task {task_id} with: {updates}")
        
        # Call backend API
        response = await http_client.put(
            f"{BACKEND_API_URL}/tasks/{task_id}",
            json=updates,
        )
        
        if response.status_code != 200:
            raise BackendError(
                f"Failed to update task: {response.text}",
                status_code=response.status_code
            )
        
        task_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)
        
        log_tool_execution("update_task", "success", duration_ms, {"task_id": task_id})
        
        return {
            "success": True,
            "task_id": task_id,
            "task": task_data,
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("update_task", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("update_task", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("update_task", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("update_task", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("update_task", str(e))


@function_tool
async def delete_task(task_id: str) -> Dict[str, Any]:
    """
    Delete a task.

    Args:
        task_id: Task UUID to delete
        task_id: Task UUID
    
    Returns:
        Dictionary with success status and message
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Deleting task {task_id}")
        
        # Call backend API
        response = await http_client.delete(
            f"{BACKEND_API_URL}/tasks/{task_id}",
        )
        
        if response.status_code not in [200, 204]:
            raise BackendError(
                f"Failed to delete task: {response.text}",
                status_code=response.status_code
            )
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("delete_task", "success", duration_ms, {"task_id": task_id})
        
        return {
            "success": True,
            "message": f"Task {task_id} deleted successfully",
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("delete_task", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("delete_task", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("delete_task", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("delete_task", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("delete_task", str(e))


@function_tool
async def mark_task_complete(task_id: str) -> Dict[str, Any]:
    """
    Mark a task as completed.

    Args:
        task_id: Task UUID
    
    Returns:
        Dictionary with success status and updated task
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Marking task {task_id} as complete")
        
        # Call backend API
        response = await http_client.patch(
            f"{BACKEND_API_URL}/tasks/{task_id}/complete",
        )
        
        if response.status_code != 200:
            raise BackendError(
                f"Failed to mark task complete: {response.text}",
                status_code=response.status_code
            )
        
        task_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)
        
        log_tool_execution("mark_task_complete", "success", duration_ms, {"task_id": task_id})
        
        return {
            "success": True,
            "task_id": task_id,
            "task": task_data,
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("mark_task_complete", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("mark_task_complete", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("mark_task_complete", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("mark_task_complete", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("mark_task_complete", str(e))
