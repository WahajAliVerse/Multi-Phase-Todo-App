"""
Recurrence and Scheduling Tools

Wrappers for backend recurrence and reminder API endpoints.
"""

import httpx
from typing import Optional, Dict, Any, List
from agents import function_tool
from pydantic import Field

from ..config import BACKEND_API_URL
from ..logger import agent_logger, log_tool_execution, log_recurrence_operation
from ..error_handler import ToolExecutionError, BackendError, ValidationError

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


@function_tool
async def update_recurrence_pattern(
    recurrence_id: str = Field(description="Recurrence pattern UUID to update"),
    frequency: Optional[str] = Field(default=None, description="New frequency: daily, weekly, monthly, yearly"),
    interval: Optional[int] = Field(default=None, description="New repeat interval"),
    days_of_week: Optional[List[str]] = Field(default=None, description="New days of week for weekly patterns"),
    day_of_month: Optional[int] = Field(default=None, description="New day of month for monthly patterns"),
    end_condition: Optional[str] = Field(default=None, description="New end condition: never, after, on_date"),
    end_after_occurrences: Optional[int] = Field(default=None, description="New max occurrences"),
    end_date: Optional[str] = Field(default=None, description="New end date in ISO format")
) -> Dict[str, Any]:
    """
    Update an existing recurring task pattern.

    Args:
        recurrence_id: Recurrence pattern UUID
        frequency: New frequency (optional)
        interval: New interval (optional)
        days_of_week: New days for weekly patterns (optional)
        day_of_month: New day for monthly patterns (optional)
        end_condition: New end condition (optional)
        end_after_occurrences: New max occurrences (optional)
        end_date: New end date (optional)

    Returns:
        Dictionary with success status and updated pattern details
    """
    import time
    start_time = time.time()

    try:
        agent_logger.info(f"Updating recurrence pattern {recurrence_id}")

        # Build update payload with only provided fields
        updates = {}
        if frequency is not None:
            updates["frequency"] = frequency
        if interval is not None:
            updates["interval"] = interval
        if days_of_week is not None:
            updates["days_of_week"] = days_of_week
        if day_of_month is not None:
            updates["day_of_month"] = day_of_month
        if end_condition is not None:
            updates["end_condition"] = end_condition
        if end_after_occurrences is not None:
            updates["end_after_occurrences"] = end_after_occurrences
        if end_date is not None:
            updates["end_date"] = end_date

        if not updates:
            raise ValidationError("update_recurrence_pattern", "No fields provided to update")

        response = await http_client.put(
            f"{BACKEND_API_URL}/recurrence/{recurrence_id}",
            json=updates,
        )

        if response.status_code not in [200, 204]:
            raise BackendError(
                f"Failed to update recurrence pattern: {response.text}",
                status_code=response.status_code
            )

        recurrence_data = response.json() if response.status_code == 200 else {}
        duration_ms = int((time.time() - start_time) * 1000)

        log_recurrence_operation("update_recurrence_pattern", "success", recurrence_id, updates)

        return {
            "success": True,
            "recurrence_id": recurrence_id,
            "pattern": recurrence_data,
            "updated_fields": list(updates.keys()),
        }

    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("update_recurrence_pattern", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("update_recurrence_pattern", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("update_recurrence_pattern", "failed", duration_ms, {"error": e.message})
        raise
    except ValidationError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("update_recurrence_pattern", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("update_recurrence_pattern", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("update_recurrence_pattern", str(e))


@function_tool
async def generate_next_occurrence(
    recurrence_id: str = Field(description="Recurrence pattern UUID"),
    current_date: str = Field(description="Current date in ISO format (YYYY-MM-DD)")
) -> Dict[str, Any]:
    """
    Calculate the next occurrence date for a recurring task.

    Args:
        recurrence_id: Recurrence pattern UUID
        current_date: Current date to calculate from

    Returns:
        Dictionary with success status and next occurrence date
    """
    import time
    start_time = time.time()

    try:
        agent_logger.info(f"Calculating next occurrence for recurrence {recurrence_id}")

        response = await http_client.get(
            f"{BACKEND_API_URL}/recurrence/{recurrence_id}/next-occurrence",
            params={"current_date": current_date},
        )

        if response.status_code != 200:
            raise BackendError(
                f"Failed to calculate next occurrence: {response.text}",
                status_code=response.status_code
            )

        occurrence_data = response.json()
        duration_ms = int((time.time() - start_time) * 1000)

        log_recurrence_operation(
            "generate_next_occurrence",
            "success",
            recurrence_id,
            {"current_date": current_date, "next_date": occurrence_data.get("next_occurrence")}
        )

        return {
            "success": True,
            "recurrence_id": recurrence_id,
            "next_occurrence": occurrence_data.get("next_occurrence"),
            "should_end": occurrence_data.get("should_end", False),
        }

    except httpx.RequestError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("generate_next_occurrence", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("generate_next_occurrence", f"Network error: {str(e)}")
    except BackendError as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("generate_next_occurrence", "failed", duration_ms, {"error": e.message})
        raise
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        log_tool_execution("generate_next_occurrence", "failed", duration_ms, {"error": str(e)})
        raise ToolExecutionError("generate_next_occurrence", str(e))


def validate_recurrence_pattern_input(
    frequency: str,
    interval: int = 1,
    days_of_week: Optional[List[str]] = None,
    day_of_month: Optional[int] = None,
    end_condition: str = "never",
    end_after_occurrences: Optional[int] = None,
    end_date: Optional[str] = None
) -> tuple[bool, Optional[str]]:
    """
    Validate recurrence pattern input before API call.

    Args:
        frequency: Recurrence frequency
        interval: Repeat interval
        days_of_week: Days for weekly patterns
        day_of_month: Day for monthly patterns
        end_condition: End condition
        end_after_occurrences: Max occurrences
        end_date: End date

    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate frequency
    valid_frequencies = {"daily", "weekly", "monthly", "yearly"}
    if frequency not in valid_frequencies:
        return False, f"Invalid frequency '{frequency}'. Must be one of: {', '.join(valid_frequencies)}"

    # Validate interval
    if not isinstance(interval, int) or interval < 1:
        return False, "Interval must be a positive integer (1 or greater)"

    # Validate days of week for weekly frequency
    if frequency == "weekly" and days_of_week:
        valid_days = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"}
        invalid_days = set(days_of_week) - valid_days
        if invalid_days:
            return False, f"Invalid days of week: {', '.join(invalid_days)}. Valid: {', '.join(valid_days)}"

    # Validate day of month for monthly frequency
    if frequency == "monthly" and day_of_month is not None:
        if not isinstance(day_of_month, int) or day_of_month < 1 or day_of_month > 31:
            return False, "Day of month must be between 1 and 31"

    # Validate end condition
    valid_end_conditions = {"never", "after", "on_date"}
    if end_condition not in valid_end_conditions:
        return False, f"Invalid end condition '{end_condition}'. Must be one of: {', '.join(valid_end_conditions)}"

    # Validate end after occurrences
    if end_condition == "after":
        if end_after_occurrences is None or not isinstance(end_after_occurrences, int) or end_after_occurrences < 1:
            return False, "end_after_occurrences must be a positive integer when end_condition is 'after'"

    # Validate end date
    if end_condition == "on_date":
        if not end_date:
            return False, "end_date is required when end_condition is 'on_date'"

        # Validate date format
        import re
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", end_date):
            return False, "end_date must be in ISO format (YYYY-MM-DD)"

        # Check if date is in the future
        from datetime import datetime
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            if end_dt < datetime.now():
                return False, "end_date must be in the future"
        except ValueError:
            return False, "Invalid end_date format"

    return True, None
