"""
Natural Language Date Parser

Parses natural language date/time expressions into structured datetime objects.
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, Any
import re

from ..logger import agent_logger


# Common date/time patterns
RELATIVE_DAYS = {
    "today": 0,
    "tomorrow": 1,
    "yesterday": -1,
    "next week": 7,
    "in a week": 7,
    "in two weeks": 14,
}

RELATIVE_TIMES = {
    "morning": "09:00",
    "afternoon": "14:00",
    "evening": "18:00",
    "night": "20:00",
    "noon": "12:00",
    "midnight": "23:59",
}

DAY_NAMES = {
    "monday": 0, "mon": 0,
    "tuesday": 1, "tue": 1,
    "wednesday": 2, "wed": 2,
    "thursday": 3, "thu": 3,
    "friday": 4, "fri": 4,
    "saturday": 5, "sat": 5,
    "sunday": 6, "sun": 6,
}


def parse_relative_date(text: str, reference_date: datetime = None) -> Optional[datetime]:
    """
    Parse relative date expressions like "tomorrow", "next week".
    
    Args:
        text: Natural language date expression
        reference_date: Base date for calculation (default: now)
    
    Returns:
        Parsed datetime or None
    """
    if reference_date is None:
        reference_date = datetime.now()
    
    text = text.lower().strip()
    
    # Check relative days
    for pattern, days_offset in RELATIVE_DAYS.items():
        if pattern in text:
            return reference_date + timedelta(days=days_offset)
    
    # Check day names (next Monday, this Friday)
    for day_name, weekday in DAY_NAMES.items():
        if day_name in text:
            days_ahead = weekday - reference_date.weekday()
            if days_ahead < 0:  # Target day already happened this week
                days_ahead += 7
            if "next" in text:
                days_ahead += 7
            return reference_date + timedelta(days=days_ahead)
    
    return None


def parse_time_expression(text: str) -> Optional[str]:
    """
    Parse time expressions like "5pm", "in the morning".
    
    Args:
        text: Natural language time expression
    
    Returns:
        Time string (HH:MM) or None
    """
    text = text.lower().strip()
    
    # Check relative times
    for pattern, time_str in RELATIVE_TIMES.items():
        if pattern in text:
            return time_str
    
    # Check explicit times (5pm, 17:00, 5:30pm)
    time_patterns = [
        r"(\d{1,2})\s*(am|pm)",  # 5pm, 5am
        r"(\d{1,2}):(\d{2})\s*(am|pm)?",  # 5:30pm, 17:00
    ]
    
    for pattern in time_patterns:
        match = re.search(pattern, text)
        if match:
            groups = match.groups()
            if len(groups) == 2:
                hour = int(groups[0])
                period = groups[1].lower()
                if period == "pm" and hour != 12:
                    hour += 12
                elif period == "am" and hour == 12:
                    hour = 0
                return f"{hour:02d}:00"
            elif len(groups) >= 3:
                hour = int(groups[0])
                minute = int(groups[1])
                period = groups[2] if groups[2] else None
                if period:
                    period = period.lower()
                    if period == "pm" and hour != 12:
                        hour += 12
                    elif period == "am" and hour == 12:
                        hour = 0
                return f"{hour:02d}:{minute:02d}"
    
    return None


def parse_date_with_time(text: str) -> Tuple[Optional[datetime], Optional[str]]:
    """
    Parse combined date and time expressions.
    
    Args:
        text: Natural language date/time expression
    
    Returns:
        Tuple of (date, time) where either can be None
    """
    date = parse_relative_date(text)
    time = parse_time_expression(text)
    
    if date and time:
        date = date.replace(
            hour=int(time.split(":")[0]),
            minute=int(time.split(":")[1])
        )
    
    return date, time


def parse_natural_date(text: str) -> Dict[str, Any]:
    """
    Comprehensive natural language date parser.
    
    Args:
        text: Natural language date/time expression
    
    Returns:
        Dictionary with parsed date components
    """
    result = {
        "success": False,
        "date": None,
        "time": None,
        "datetime": None,
        "original": text,
        "confidence": 0.0,
    }
    
    text = text.lower().strip()
    
    # Try parsing date
    date = parse_relative_date(text)
    if date:
        result["date"] = date.strftime("%Y-%m-%d")
        result["confidence"] += 0.5
        result["success"] = True
    
    # Try parsing time
    time = parse_time_expression(text)
    if time:
        result["time"] = time
        result["confidence"] += 0.5
        result["success"] = True
    
    # Combine if both present
    if date and time:
        result["datetime"] = date.replace(
            hour=int(time.split(":")[0]),
            minute=int(time.split(":")[1])
        ).isoformat()
    elif date:
        result["datetime"] = date.isoformat()
    
    agent_logger.debug(f"Parsed date: {text} -> {result}")
    return result


def format_datetime_for_display(dt: datetime) -> str:
    """
    Format datetime for user-friendly display.
    
    Args:
        dt: Datetime object
    
    Returns:
        Human-readable date string
    """
    now = datetime.now()
    diff = dt - now
    
    if diff.days == 0:
        return "today"
    elif diff.days == 1:
        return "tomorrow"
    elif diff.days < 7:
        return dt.strftime("%A")
    else:
        return dt.strftime("%B %d, %Y")
