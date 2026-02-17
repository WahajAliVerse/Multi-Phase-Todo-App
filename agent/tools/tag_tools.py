"""
Tag Management Tools

Wrappers for backend tag API endpoints.
"""

import httpx
from typing import Optional, List, Dict, Any
from agents import function_tool
from pydantic import BaseModel, Field

from ..config import BACKEND_API_URL, logger
from ..logger import agent_logger, log_tool_execution
from ..error_handler import ToolExecutionError, BackendError


# Reuse http_client from task_tools
from .task_tools import http_client


@function_tool
async def create_tag(
    name: str = Field(description="Tag name (required, max 50 chars)"),
    color: str = Field(description="Tag color in hex format (e.g., #FF5733)")
) -> Dict[str, Any]:
    """
    Create a new tag.
    
    Args:
        name: Tag name
        color: Hex color code
    
    Returns:
        Dictionary with success status, tag_id, and tag details
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Creating tag: '{name}' with color {color}")
        
        # Validate color format
        if not color.startswith("#") or len(color) != 7:
            raise ToolExecutionError("create_tag", "Color must be in hex format (e.g., #FF5733)")
        
        response = await http_client.post(
            f"{BACKEND_API_URL}/tags",
            json={"name": name, "color": color},
        )
        
        if response.status_code not in [200, 201]:
            raise BackendError(
                f"Failed to create tag: {response.text}",
                status_code=response.status_code
            )
        
        tag_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)
        
        log_tool_execution("create_tag", "success", duration_ms, {"tag_id": tag_data.get("id")})
        
        return {
            "success": True,
            "tag_id": tag_data.get("id"),
            "tag": tag_data,
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_tag", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("create_tag", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_tag", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_tag", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("create_tag", str(e))


@function_tool
async def get_tags() -> Dict[str, Any]:
    """
    Retrieve all tags.
    
    Returns:
        Dictionary with success status and tags list
    """
    import time
    start_time = time.time()
    
    try:
        response = await http_client.get(f"{BACKEND_API_URL}/tags")
        
        if response.status_code != 200:
            raise BackendError(
                f"Failed to get tags: {response.text}",
                status_code=response.status_code
            )
        
        tags_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)
        
        tags = tags_data if isinstance(tags_data, list) else tags_data.get("tags", [])
        log_tool_execution("get_tags", "success", duration_ms, {"count": len(tags)})
        
        return {
            "success": True,
            "tags": tags,
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("get_tags", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("get_tags", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("get_tags", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("get_tags", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("get_tags", str(e))


@function_tool
async def update_tag(
    tag_id: str = Field(description="Tag UUID to update"),
    updates: Dict[str, Any] = Field(description="Fields to update: name, color")
) -> Dict[str, Any]:
    """
    Update an existing tag.
    
    Args:
        tag_id: Tag UUID
        updates: Dictionary of fields to update
    
    Returns:
        Dictionary with success status and updated tag
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Updating tag {tag_id} with: {updates}")
        
        response = await http_client.put(
            f"{BACKEND_API_URL}/tags/{tag_id}",
            json=updates,
        )
        
        if response.status_code != 200:
            raise BackendError(
                f"Failed to update tag: {response.text}",
                status_code=response.status_code
            )
        
        tag_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)
        
        log_tool_execution("update_tag", "success", duration_ms, {"tag_id": tag_id})
        
        return {
            "success": True,
            "tag_id": tag_id,
            "tag": tag_data,
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("update_tag", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("update_tag", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("update_tag", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("update_tag", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("update_tag", str(e))


@function_tool
async def delete_tag(tag_id: str = Field(description="Tag UUID to delete")) -> Dict[str, Any]:
    """
    Delete a tag.
    
    Args:
        tag_id: Tag UUID
    
    Returns:
        Dictionary with success status and message
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Deleting tag {tag_id}")
        
        response = await http_client.delete(f"{BACKEND_API_URL}/tags/{tag_id}")
        
        if response.status_code not in [200, 204]:
            raise BackendError(
                f"Failed to delete tag: {response.text}",
                status_code=response.status_code
            )
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("delete_tag", "success", duration_ms, {"tag_id": tag_id})
        
        return {
            "success": True,
            "message": f"Tag {tag_id} deleted successfully",
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("delete_tag", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("delete_tag", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("delete_tag", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("delete_tag", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("delete_tag", str(e))


@function_tool
async def assign_tag_to_task(
    tag_id: str = Field(description="Tag UUID to assign"),
    task_id: str = Field(description="Task UUID to assign tag to")
) -> Dict[str, Any]:
    """
    Assign a tag to a task.
    
    Args:
        tag_id: Tag UUID
        task_id: Task UUID
    
    Returns:
        Dictionary with success status and message
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Assigning tag {tag_id} to task {task_id}")
        
        response = await http_client.post(
            f"{BACKEND_API_URL}/tasks/{task_id}/tags/{tag_id}",
        )
        
        if response.status_code not in [200, 201]:
            raise BackendError(
                f"Failed to assign tag: {response.text}",
                status_code=response.status_code
            )
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("assign_tag_to_task", "success", duration_ms, {"tag_id": tag_id, "task_id": task_id})
        
        return {
            "success": True,
            "message": f"Tag assigned successfully",
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("assign_tag_to_task", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("assign_tag_to_task", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("assign_tag_to_task", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("assign_tag_to_task", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("assign_tag_to_task", str(e))
