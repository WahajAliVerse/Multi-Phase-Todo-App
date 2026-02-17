"""
Recurrence and Scheduling Tools

Wrappers for backend recurrence and reminder API endpoints.
"""

import httpx
from typing import Optional, Dict, Any, List
from agents import function_tool
from pydantic import Field

from ..config import BACKEND_API_URL
from ..logger import agent_logger, log_tool_execution
from ..error_handler import ToolExecutionError, BackendError

# Reuse http_client
from .task_tools import http_client


@function_tool
async def create_recurring_task(
    task_id: str = Field(description="Task UUID to make recurring"),
    frequency: str = Field(description="Recurrence frequency: daily, weekly, monthly, yearly"),
    interval: int = Field(default=1, description="How often to repeat (every N days/weeks/etc.)"),
    days_of_week: Optional[List[str]] = Field(default=None, description="Days of week for weekly patterns (mon, tue, etc.)"),
    day_of_month: Optional[int] = Field(default=None, description="Day of month (1-31) for monthly patterns"),
    end_condition: str = Field(default="never", description="End condition: never, after, on_date"),
    end_after_occurrences: Optional[int] = Field(default=None, description="Number of occurrences before stopping"),
    end_date: Optional[str] = Field(default=None, description="End date in ISO format")
) -> Dict[str, Any]:
    """
    Create a recurring task pattern.
    
    Args:
        task_id: Task UUID
        frequency: Recurrence frequency
        interval: Repeat interval
        days_of_week: Days for weekly patterns
        day_of_month: Day for monthly patterns
        end_condition: When recurrence ends
        end_after_occurrences: Max occurrences
        end_date: End date
    
    Returns:
        Dictionary with success status, recurrence_id, and pattern details
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Creating recurring pattern for task {task_id}")
        
        pattern = {
            "frequency": frequency,
            "interval": interval,
            "end_condition": end_condition,
        }
        
        if days_of_week:
            pattern["days_of_week"] = days_of_week
        if day_of_month:
            pattern["day_of_month"] = day_of_month
        if end_condition == "after" and end_after_occurrences:
            pattern["end_after_occurrences"] = end_after_occurrences
        if end_condition == "on_date" and end_date:
            pattern["end_date"] = end_date
        
        response = await http_client.post(
            f"{BACKEND_API_URL}/tasks/{task_id}/recurrence",
            json={"pattern": pattern},
        )
        
        if response.status_code not in [200, 201]:
            raise BackendError(
                f"Failed to create recurring task: {response.text}",
                status_code=response.status_code
            )
        
        recurrence_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)
        
        log_tool_execution("create_recurring_task", "success", duration_ms, {"task_id": task_id})
        
        return {
            "success": True,
            "recurrence_id": recurrence_data.get("id"),
            "pattern": recurrence_data,
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_recurring_task", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("create_recurring_task", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_recurring_task", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("create_recurring_task", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("create_recurring_task", str(e))


@function_tool
async def cancel_recurrence(
    recurrence_id: str = Field(description="Recurrence pattern UUID to cancel")
) -> Dict[str, Any]:
    """
    Cancel a recurring task pattern.
    
    Args:
        recurrence_id: Recurrence pattern UUID
    
    Returns:
        Dictionary with success status and message
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Cancelling recurrence {recurrence_id}")
        
        response = await http_client.delete(
            f"{BACKEND_API_URL}/recurrence/{recurrence_id}",
        )
        
        if response.status_code not in [200, 204]:
            raise BackendError(
                f"Failed to cancel recurrence: {response.text}",
                status_code=response.status_code
            )
        
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("cancel_recurrence", "success", duration_ms, {"recurrence_id": recurrence_id})
        
        return {
            "success": True,
            "message": f"Recurrence {recurrence_id} cancelled successfully",
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("cancel_recurrence", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("cancel_recurrence", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("cancel_recurrence", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("cancel_recurrence", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("cancel_recurrence", str(e))


@function_tool
async def schedule_task_reminder(
    task_id: str = Field(description="Task UUID to schedule reminder for"),
    reminder_time: str = Field(description="Reminder time in ISO 8601 format"),
    delivery_method: str = Field(default="browser", description="Delivery method: browser, email, push"),
    message: Optional[str] = Field(default=None, description="Reminder message")
) -> Dict[str, Any]:
    """
    Schedule a reminder for a task.
    
    Args:
        task_id: Task UUID
        reminder_time: When to trigger reminder
        delivery_method: How to deliver reminder
        message: Reminder message
    
    Returns:
        Dictionary with success status, reminder_id, and reminder details
    """
    import time
    start_time = time.time()
    
    try:
        agent_logger.info(f"Scheduling reminder for task {task_id} at {reminder_time}")
        
        response = await http_client.post(
            f"{BACKEND_API_URL}/tasks/{task_id}/reminders",
            json={
                "reminder_time": reminder_time,
                "delivery_method": delivery_method,
                "message": message,
            },
        )
        
        if response.status_code not in [200, 201]:
            raise BackendError(
                f"Failed to schedule reminder: {response.text}",
                status_code=response.status_code
            )
        
        reminder_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)
        
        log_tool_execution("schedule_task_reminder", "success", duration_ms, {"task_id": task_id})
        
        return {
            "success": True,
            "reminder_id": reminder_data.get("id"),
            "reminder": reminder_data,
        }
        
    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("schedule_task_reminder", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("schedule_task_reminder", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("schedule_task_reminder", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("schedule_task_reminder", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("schedule_task_reminder", str(e))
