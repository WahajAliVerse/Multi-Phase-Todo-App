import re
from typing import Union


def validate_task_title(title: str) -> bool:
    """Validate task title (1-255 characters, non-empty)"""
    if not isinstance(title, str):
        return False
    return 1 <= len(title) <= 255


def validate_task_description(description: str) -> bool:
    """Validate task description (max 1000 characters)"""
    if not isinstance(description, str):
        return False
    return len(description) <= 1000


def validate_task_id(task_id: Union[int, str]) -> bool:
    """Validate task ID (positive integer)"""
    if isinstance(task_id, str):
        try:
            task_id = int(task_id)
        except ValueError:
            return False
    return isinstance(task_id, int) and task_id > 0