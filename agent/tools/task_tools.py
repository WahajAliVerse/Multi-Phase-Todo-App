"""
Task Management Tools

Wrappers for backend task API endpoints using OpenAI Agents SDK function tools.
"""

import httpx
from typing import Optional, List, Dict, Any
from agents import function_tool
from pydantic import BaseModel, Field

from ..config import BACKEND_API_URL, logger
from ..logger import agent_logger, log_tool_execution
from ..error_handler import (
    ToolExecutionError,
    BackendError,
    retry_with_backoff,
    handle_llm_errors,
)


# HTTP client for backend API calls
http_client = httpx.AsyncClient(timeout=30.0)


@function_tool
async def create_task(
    title: str = Field(description="Task title (required, max 200 chars)"),
    description: Optional[str] = Field(default=None, description="Task description (optional, max 1000 chars)"),
    due_date: Optional[str] = Field(default=None, description="Due date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)"),
    priority: Optional[str] = Field(default="medium", description="Task priority: low, medium, or high"),
    tags: Optional[List[str]] = Field(default=None, description="List of tag UUIDs to assign")
) -> Dict[str, Any]:
    """
    Create a new task in the todo app.
    
    Args:
        title: Task title
        description: Task description (optional)
        due_date: Due date in ISO format (optional)
        priority: Priority level (low, medium, high)
        tags: List of tag IDs to assign (optional)
    
    Returns:
        Dictionary with success status, task_id, and task details
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Creating task: '{title}'")
        
        # Prepare request
        payload = {
            "title": title,
            "description": description,
            "due_date": due_date,
            "priority": priority,
            "tags": tags or [],
        }
        
        # Remove None values
        payload = {k: v for k, v in payload.items() if v is not None}
        
        # Call backend API
        # Note: In production, include authentication cookies from request context
        response = await http_client.post(
            f"{BACKEND_API_URL}/tasks",
            json=payload,
            # cookies=request_cookies if available
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
    status: Optional[str] = Field(default="all", description="Filter by status: all, active, or completed"),
    priority: Optional[str] = Field(default="all", description="Filter by priority: all, low, medium, or high"),
    tag_ids: Optional[List[str]] = Field(default=None, description="Filter by tag IDs"),
    search: Optional[str] = Field(default=None, description="Search in title/description"),
    date_from: Optional[str] = Field(default=None, description="Filter tasks from this date (ISO format)"),
    date_to: Optional[str] = Field(default=None, description="Filter tasks until this date (ISO format)")
) -> Dict[str, Any]:
    """
    Retrieve tasks with optional filtering.
    
    Args:
        status: Filter by status (all, active, completed)
        priority: Filter by priority (all, low, medium, high)
        tag_ids: Filter by tag IDs
        search: Search term in title/description
        date_from: Filter from date
        date_to: Filter to date
    
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
    task_id: str = Field(description="Task UUID to update"),
    updates: Dict[str, Any] = Field(description="Fields to update: title, description, due_date, priority, status")
) -> Dict[str, Any]:
    """
    Update an existing task.
    
    Args:
        task_id: Task UUID
        updates: Dictionary of fields to update
    
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
async def delete_task(task_id: str = Field(description="Task UUID to delete")) -> Dict[str, Any]:
    """
    Delete a task.
    
    Args:
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
async def mark_task_complete(task_id: str = Field(description="Task UUID to mark as complete")) -> Dict[str, Any]:
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
