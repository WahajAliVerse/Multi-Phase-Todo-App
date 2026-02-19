"""
Tag Management Tools

Wrappers for backend tag API endpoints with color validation.
"""

import httpx
import re
from typing import Optional, List, Dict, Any
from agents import function_tool
from pydantic import BaseModel, Field

from ..config import BACKEND_API_URL, logger
from ..logger import agent_logger, log_tool_execution, log_tag_operation
from ..error_handler import ToolExecutionError, BackendError


# Reuse http_client from task_tools
from .task_tools import http_client


# Named color mappings to hex codes
NAMED_COLORS: Dict[str, str] = {
    "red": "#FF0000",
    "blue": "#0000FF",
    "green": "#008000",
    "yellow": "#FFFF00",
    "orange": "#FFA500",
    "purple": "#800080",
    "pink": "#FFC0CB",
    "black": "#000000",
    "white": "#FFFFFF",
    "gray": "#808080",
    "grey": "#808080",
    "cyan": "#00FFFF",
    "magenta": "#FF00FF",
    "lime": "#00FF00",
    "maroon": "#800000",
    "navy": "#000080",
    "olive": "#808000",
    "teal": "#008080",
    "aqua": "#00FFFF",
    "fuchsia": "#FF00FF",
    "silver": "#C0C0C0",
    "brown": "#A52A2A",
    "coral": "#FF7F50",
    "crimson": "#DC143C",
    "gold": "#FFD700",
    "indigo": "#4B0082",
    "ivory": "#FFFFF0",
    "khaki": "#F0E68C",
    "lavender": "#E6E6FA",
    "beige": "#F5F5DC",
    "turquoise": "#40E0D0",
    "violet": "#EE82EE",
    "plum": "#DDA0DD",
    "orchid": "#DA70D6",
    "slate": "#708090",
    "salmon": "#FA8072",
}


def validate_color(color: str) -> str:
    """
    Validate and normalize color input.
    
    Supports:
    - Named colors (e.g., "red", "blue") → converts to hex
    - Hex colors (e.g., "#FF5733", "#FFF")
    
    Args:
        color: Color name or hex code
        
    Returns:
        Normalized hex color code (7 characters with #)
        
    Raises:
        ToolExecutionError: If color format is invalid
    """
    if not color:
        raise ToolExecutionError("validate_color", "Color is required")
    
    color_lower = color.lower().strip()
    
    # Check if it's a named color
    if color_lower in NAMED_COLORS:
        return NAMED_COLORS[color_lower]
    
    # Check if it's a hex color
    if color.startswith("#"):
        hex_part = color[1:]
        
        # Validate hex format (3 or 6 characters)
        if len(hex_part) == 3:
            # Expand 3-char hex to 6-char (e.g., #FFF → #FFFFFF)
            if re.match(r'^[0-9A-Fa-f]{3}$', hex_part):
                expanded = ''.join([c * 2 for c in hex_part])
                return f"#{expanded.upper()}"
            else:
                raise ToolExecutionError(
                    "validate_color",
                    f"Invalid hex color format: {color}. Expected 3 or 6 hex digits."
                )
        elif len(hex_part) == 6:
            # Validate 6-character hex
            if re.match(r'^[0-9A-Fa-f]{6}$', hex_part):
                return f"#{hex_part.upper()}"
            else:
                raise ToolExecutionError(
                    "validate_color",
                    f"Invalid hex color format: {color}. Expected valid hex digits (0-9, A-F)."
                )
        else:
            raise ToolExecutionError(
                "validate_color",
                f"Invalid hex color length: {color}. Expected 3 or 6 hex digits after #."
            )
    else:
        # Not a recognized format
        raise ToolExecutionError(
            "validate_color",
            f"Invalid color format: {color}. Use named colors (red, blue, green, etc.) or hex format (#FF5733)."
        )


def get_color_preview(color: str) -> str:
    """
    Get a human-readable color preview.
    
    Args:
        color: Hex color code
        
    Returns:
        Human-readable color description
    """
    color_upper = color.upper()
    
    # Find matching named color
    for name, hex_code in NAMED_COLORS.items():
        if hex_code == color_upper:
            return name.capitalize()
    
    return color


@function_tool
async def create_tag(
    name: str = Field(description="Tag name (required, max 50 chars)"),
    color: str = Field(description="Tag color - named (red, blue, green) or hex (#FF5733)")
) -> Dict[str, Any]:
    """
    Create a new tag.

    Args:
        name: Tag name
        color: Tag color (named or hex format)

    Returns:
        Dictionary with success status, tag_id, and tag details
    """
    import time
    start_time = time.time()

    try:
        # Validate and normalize color
        validated_color = validate_color(color)
        color_preview = get_color_preview(validated_color)
        
        agent_logger.info(f"Creating tag: '{name}' with color {validated_color} ({color_preview})")

        response = await http_client.post(
            f"{BACKEND_API_URL}/tags",
            json={"name": name, "color": validated_color},
        )

        if response.status_code not in [200, 201]:
            raise BackendError(
                f"Failed to create tag: {response.text}",
                status_code=response.status_code
            )

        tag_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)

        log_tool_execution("create_tag", "success", duration_ms, {"tag_id": tag_data.get("id")})
        log_tag_operation("create", "success", tag_data.get("id"), {
            "name": name,
            "color": validated_color,
            "color_name": color_preview
        })

        return {
            "success": True,
            "tag_id": tag_data.get("id"),
            "tag": tag_data,
            "color_name": color_preview,
        }

    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_tag", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("create_tag", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_tag", "failed", duration_ms, {"error": e.message})
        raise
    except ToolExecutionError as e:
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
        updates: Dictionary of fields to update (name, color)

    Returns:
        Dictionary with success status and updated tag
    """
    import time
    start_time = time.time()

    try:
        # Validate color if present in updates
        if "color" in updates:
            updates["color"] = validate_color(updates["color"])
        
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
        log_tag_operation("update", "success", tag_id, {"updates": updates})

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
    except ToolExecutionError as e:
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
        log_tag_operation("delete", "success", tag_id, {})

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
        log_tag_operation("assign", "success", tag_id, {"task_id": task_id})

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
