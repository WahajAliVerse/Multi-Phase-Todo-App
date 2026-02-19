"""
Natural Language Date Parser

Parses natural language date/time expressions into structured datetime objects.
Supports reminder-specific patterns like "30 minutes before", "1 hour before", etc.
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, Any, List
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

# Reminder offset patterns (for "X minutes/hours before" expressions)
REMINDER_OFFSETS = {
    "5 minutes before": {"minutes": 5},
    "10 minutes before": {"minutes": 10},
    "15 minutes before": {"minutes": 15},
    "20 minutes before": {"minutes": 20},
    "30 minutes before": {"minutes": 30},
    "45 minutes before": {"minutes": 45},
    "1 hour before": {"hours": 1},
    "2 hours before": {"hours": 2},
    "3 hours before": {"hours": 3},
    "1 day before": {"days": 1},
    "2 days before": {"days": 2},
    "1 week before": {"days": 7},
}

# Recurring reminder patterns
RECURRING_REMINDER_PATTERNS = {
    "every day at": "daily",
    "daily at": "daily",
    "every morning at": "daily_morning",
    "every evening at": "daily_evening",
    "every night at": "daily_night",
    "every weekday at": "weekday",
    "every monday at": "weekly_mon",
    "every tuesday at": "weekly_tue",
    "every wednesday at": "weekly_wed",
    "every thursday at": "weekly_thu",
    "every friday at": "weekly_fri",
    "every saturday at": "weekly_sat",
    "every sunday at": "weekly_sun",
    "every week on": "weekly",
    "every month on": "monthly",
    "monthly on": "monthly",
}

# Delivery method patterns
DELIVERY_METHODS = {
    "via browser": "browser",
    "browser notification": "browser",
    "send email": "email",
    "via email": "email",
    "email me": "email",
    "push notification": "push",
    "via push": "push",
    "send push": "push",
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


def parse_reminder_offset(text: str, event_time: datetime = None) -> Optional[Dict[str, Any]]:
    """
    Parse reminder offset expressions like "30 minutes before", "1 hour before".

    Args:
        text: Natural language reminder expression
        event_time: The event time to calculate reminder time from (optional)

    Returns:
        Dictionary with offset details and calculated reminder time
    """
    text_lower = text.lower().strip()

    # Check for exact offset patterns
    for pattern, offset in REMINDER_OFFSETS.items():
        if pattern in text_lower:
            result = {
                "success": True,
                "offset": offset,
                "offset_text": pattern,
                "type": "before_event",
            }

            if event_time:
                # Calculate actual reminder time
                reminder_time = event_time - timedelta(
                    hours=offset.get("hours", 0),
                    minutes=offset.get("minutes", 0),
                    days=offset.get("days", 0),
                )
                result["reminder_time"] = reminder_time.isoformat()
                result["formatted_time"] = format_reminder_time(reminder_time, event_time)

            return result

    # Check for dynamic offset patterns (e.g., "45 minutes before", "2 hours before")
    minute_match = re.search(r"(\d+)\s*minutes?\s*before", text_lower)
    if minute_match:
        minutes = int(minute_match.group(1))
        result = {
            "success": True,
            "offset": {"minutes": minutes},
            "offset_text": f"{minutes} minutes before",
            "type": "before_event",
        }

        if event_time:
            reminder_time = event_time - timedelta(minutes=minutes)
            result["reminder_time"] = reminder_time.isoformat()
            result["formatted_time"] = format_reminder_time(reminder_time, event_time)

        return result

    hour_match = re.search(r"(\d+(?:\.\d+)?)\s*hours?\s*before", text_lower)
    if hour_match:
        hours = float(hour_match.group(1))
        total_minutes = int(hours * 60)
        result = {
            "success": True,
            "offset": {"hours": int(hours), "minutes": total_minutes % 60},
            "offset_text": f"{hours} hours before",
            "type": "before_event",
        }

        if event_time:
            reminder_time = event_time - timedelta(minutes=total_minutes)
            result["reminder_time"] = reminder_time.isoformat()
            result["formatted_time"] = format_reminder_time(reminder_time, event_time)

        return result

    day_match = re.search(r"(\d+)\s*days?\s*before", text_lower)
    if day_match:
        days = int(day_match.group(1))
        result = {
            "success": True,
            "offset": {"days": days},
            "offset_text": f"{days} days before",
            "type": "before_event",
        }

        if event_time:
            reminder_time = event_time - timedelta(days=days)
            result["reminder_time"] = reminder_time.isoformat()
            result["formatted_time"] = format_reminder_time(reminder_time, event_time)

        return result

    return None


def parse_recurring_reminder(text: str) -> Optional[Dict[str, Any]]:
    """
    Parse recurring reminder expressions like "every day at 8pm", "daily at 9am".

    Args:
        text: Natural language recurring reminder expression

    Returns:
        Dictionary with recurrence pattern and time
    """
    text_lower = text.lower().strip()

    for pattern, recurrence_type in RECURRING_REMINDER_PATTERNS.items():
        if pattern in text_lower:
            # Extract time after the pattern
            time_match = re.search(rf"{re.escape(pattern)}\s*(\d{{1,2}}(?::\d{{2}})?\s*(?:am|pm)?)", text_lower)
            time_str = None
            if time_match:
                time_str = parse_time_expression(time_match.group(1))

            result = {
                "success": True,
                "recurrence_type": recurrence_type,
                "pattern_text": pattern,
                "time": time_str,
                "type": "recurring",
            }

            # Add human-readable description
            result["description"] = format_recurring_reminder_description(recurrence_type, time_str)

            return result

    return None


def parse_delivery_method(text: str) -> Optional[str]:
    """
    Parse delivery method from reminder expression.

    Args:
        text: Natural language reminder expression

    Returns:
        Delivery method (browser, email, push) or None
    """
    text_lower = text.lower().strip()

    for pattern, method in DELIVERY_METHODS.items():
        if pattern in text_lower:
            return method

    return None


def format_reminder_time(reminder_time: datetime, event_time: datetime = None) -> str:
    """
    Format reminder time for display.

    Args:
        reminder_time: When the reminder will trigger
        event_time: The event time (optional, for context)

    Returns:
        Human-readable reminder time string
    """
    now = datetime.now()
    diff = reminder_time - now

    if diff.days == 0:
        if diff.seconds < 3600:
            mins = diff.seconds // 60
            return f"in {mins} minutes"
        else:
            hours = diff.seconds // 3600
            return f"in {hours} hour{'s' if hours > 1 else ''}"
    elif diff.days == 1:
        return "tomorrow"
    elif diff.days < 7:
        return reminder_time.strftime("%A at %I:%M %p")
    else:
        return reminder_time.strftime("%B %d at %I:%M %p")


def format_recurring_reminder_description(recurrence_type: str, time_str: str = None) -> str:
    """
    Generate human-readable description for recurring reminder.

    Args:
        recurrence_type: Type of recurrence
        time_str: Time string (HH:MM)

    Returns:
        Human-readable description
    """
    time_display = ""
    if time_str:
        try:
            hour, minute = map(int, time_str.split(":"))
            period = "AM" if hour < 12 else "PM"
            display_hour = hour if hour <= 12 else hour - 12
            if display_hour == 0:
                display_hour = 12
            time_display = f" at {display_hour}:{minute:02d} {period}"
        except (ValueError, AttributeError):
            time_display = f" at {time_str}"

    descriptions = {
        "daily": f"Every day{time_display}",
        "daily_morning": f"Every morning{time_display}",
        "daily_evening": f"Every evening{time_display}",
        "daily_night": f"Every night{time_display}",
        "weekday": f"Every weekday{time_display}",
        "weekly_mon": f"Every Monday{time_display}",
        "weekly_tue": f"Every Tuesday{time_display}",
        "weekly_wed": f"Every Wednesday{time_display}",
        "weekly_thu": f"Every Thursday{time_display}",
        "weekly_fri": f"Every Friday{time_display}",
        "weekly_sat": f"Every Saturday{time_display}",
        "weekly_sun": f"Every Sunday{time_display}",
        "weekly": f"Every week{time_display}",
        "monthly": f"Every month{time_display}",
    }

    return descriptions.get(recurrence_type, f"Recurring{time_display}")


def parse_reminder_expression(text: str, event_time: datetime = None) -> Dict[str, Any]:
    """
    Comprehensive reminder expression parser.

    Args:
        text: Natural language reminder expression
        event_time: Event time for offset calculations (optional)

    Returns:
        Dictionary with parsed reminder details
    """
    result = {
        "success": False,
        "type": None,  # "before_event", "absolute", "recurring"
        "reminder_time": None,
        "offset": None,
        "recurrence": None,
        "delivery_method": None,
        "original": text,
    }

    text_lower = text.lower().strip()

    # Try parsing offset (before event)
    offset_result = parse_reminder_offset(text, event_time)
    if offset_result and offset_result.get("success"):
        result["success"] = True
        result["type"] = "before_event"
        result["offset"] = offset_result["offset"]
        result["reminder_time"] = offset_result.get("reminder_time")
        return result

    # Try parsing recurring reminder
    recurring_result = parse_recurring_reminder(text)
    if recurring_result and recurring_result.get("success"):
        result["success"] = True
        result["type"] = "recurring"
        result["recurrence"] = recurring_result
        result["reminder_time"] = recurring_result.get("time")
        return result

    # Try parsing absolute time
    date_result = parse_natural_date(text)
    if date_result.get("success"):
        result["success"] = True
        result["type"] = "absolute"
        result["reminder_time"] = date_result.get("datetime")
        return result

    return result


def extract_reminder_intent(text: str) -> Dict[str, Any]:
    """
    Extract complete reminder intent from natural language.

    Args:
        text: Full reminder request (e.g., "Remind me 30 minutes before my meeting via email")

    Returns:
        Dictionary with complete reminder intent
    """
    result = {
        "success": False,
        "task_reference": None,
        "reminder_config": None,
        "delivery_method": None,
        "is_recurring": False,
    }

    text_lower = text.lower().strip()

    # Extract delivery method
    delivery_method = parse_delivery_method(text)
    if delivery_method:
        result["delivery_method"] = delivery_method

    # Check for recurring pattern
    recurring_result = parse_recurring_reminder(text)
    if recurring_result and recurring_result.get("success"):
        result["is_recurring"] = True
        result["reminder_config"] = recurring_result

        # Extract task reference (what to remind about)
        # Pattern: "Remind me to [action] [recurring pattern]"
        to_match = re.search(r"remind\s+me\s+to\s+(.+?)(?:\s+(?:every|daily|monthly|weekly)|$)", text_lower)
        if to_match:
            result["task_reference"] = to_match.group(1).strip()
        result["success"] = True
        return result

    # Check for offset pattern (before event)
    offset_patterns = [
        r"remind\s+me\s+(.+?)\s+before\s+(.+?)(?:\s+(?:via|send|with)|$)",
        r"(.+?)\s+before\s+(.+?)(?:\s+(?:via|send|with)|$)",
    ]

    for pattern in offset_patterns:
        match = re.search(pattern, text_lower)
        if match:
            offset_expr = match.group(1).strip()
            event_ref = match.group(2).strip()

            # Parse the offset
            offset_result = parse_reminder_offset(offset_expr)
            if offset_result and offset_result.get("success"):
                result["reminder_config"] = offset_result
                result["task_reference"] = event_ref
                result["success"] = True
                return result

    # Check for absolute time pattern
    time_patterns = [
        r"remind\s+me\s+(?:to\s+)?(.+?)\s+(?:at|on|for)\s+(.+?)(?:\s+(?:via|send|with)|$)",
        r"set\s+a\s+reminder\s+(?:to\s+)?(.+?)\s+(?:at|on|for)\s+(.+?)(?:\s+(?:via|send|with)|$)",
    ]

    for pattern in time_patterns:
        match = re.search(pattern, text_lower)
        if match:
            task_ref = match.group(1).strip()
            time_expr = match.group(2).strip()

            # Parse the time
            date_result = parse_natural_date(time_expr)
            if date_result.get("success"):
                result["reminder_config"] = date_result
                result["task_reference"] = task_ref
                result["success"] = True
                return result

    return result


# =============================================================================
# Date Range Parsing for Task Queries (US4)
# =============================================================================


def get_date_range_for_expression(expression: str) -> Dict[str, Any]:
    """
    Parse natural language date range expressions for task queries.

    Supports:
    - "this week" - Monday to Sunday of current week
    - "next week" - Monday to Sunday of next week
    - "this month" - 1st to last day of current month
    - "next month" - 1st to last day of next month
    - "today" - today only
    - "tomorrow" - tomorrow only
    - "overdue" - before today
    - "past week" - 7 days ago to today
    - "past month" - 30 days ago to today

    Args:
        expression: Natural language date range expression

    Returns:
        Dictionary with date_from, date_to, and expression type
    """
    result = {
        "success": False,
        "date_from": None,
        "date_to": None,
        "expression_type": None,
        "original": expression,
    }

    expression_lower = expression.lower().strip()
    now = datetime.now()

    # Overdue tasks (before today)
    if "overdue" in expression_lower:
        result["success"] = True
        result["expression_type"] = "overdue"
        result["date_to"] = now.strftime("%Y-%m-%dT00:00:00")
        result["date_from"] = None  # No lower bound
        return result

    # Today
    if expression_lower == "today" or "today" in expression_lower:
        result["success"] = True
        result["expression_type"] = "today"
        result["date_from"] = now.strftime("%Y-%m-%dT00:00:00")
        result["date_to"] = now.strftime("%Y-%m-%dT23:59:59")
        return result

    # Tomorrow
    if expression_lower == "tomorrow" or "tomorrow" in expression_lower:
        tomorrow = now + timedelta(days=1)
        result["success"] = True
        result["expression_type"] = "tomorrow"
        result["date_from"] = tomorrow.strftime("%Y-%m-%dT00:00:00")
        result["date_to"] = tomorrow.strftime("%Y-%m-%dT23:59:59")
        return result

    # This week (Monday to Sunday)
    if "this week" in expression_lower:
        # Get Monday of this week
        days_since_monday = now.weekday()
        this_monday = now - timedelta(days=days_since_monday)
        this_sunday = this_monday + timedelta(days=6)

        result["success"] = True
        result["expression_type"] = "this_week"
        result["date_from"] = this_monday.strftime("%Y-%m-%dT00:00:00")
        result["date_to"] = this_sunday.strftime("%Y-%m-%dT23:59:59")
        return result

    # Next week
    if "next week" in expression_lower:
        # Get Monday of next week
        days_until_monday = (7 - now.weekday()) % 7
        if days_until_monday == 0:
            days_until_monday = 7
        next_monday = now + timedelta(days=days_until_monday)
        next_sunday = next_monday + timedelta(days=6)

        result["success"] = True
        result["expression_type"] = "next_week"
        result["date_from"] = next_monday.strftime("%Y-%m-%dT00:00:00")
        result["date_to"] = next_sunday.strftime("%Y-%m-%dT23:59:59")
        return result

    # Last week
    if "last week" in expression_lower or "past week" in expression_lower:
        # Get Monday of last week
        days_since_monday = now.weekday()
        last_monday = now - timedelta(days=days_since_monday + 7)
        last_sunday = last_monday + timedelta(days=6)

        result["success"] = True
        result["expression_type"] = "last_week"
        result["date_from"] = last_monday.strftime("%Y-%m-%dT00:00:00")
        result["date_to"] = last_sunday.strftime("%Y-%m-%dT23:59:59")
        return result

    # This month
    if "this month" in expression_lower:
        first_day = now.replace(day=1)
        if now.month == 12:
            last_day = now.replace(year=now.year + 1, month=1, day=1) - timedelta(seconds=1)
        else:
            last_day = now.replace(month=now.month + 1, day=1) - timedelta(seconds=1)

        result["success"] = True
        result["expression_type"] = "this_month"
        result["date_from"] = first_day.strftime("%Y-%m-%dT00:00:00")
        result["date_to"] = last_day.strftime("%Y-%m-%dT23:59:59")
        return result

    # Next month
    if "next month" in expression_lower:
        if now.month == 12:
            first_day = now.replace(year=now.year + 1, month=1, day=1)
            last_day = now.replace(year=now.year + 1, month=2, day=1) - timedelta(seconds=1)
        else:
            first_day = now.replace(month=now.month + 1, day=1)
            last_day = now.replace(month=now.month + 2, day=1) - timedelta(seconds=1)

        result["success"] = True
        result["expression_type"] = "next_month"
        result["date_from"] = first_day.strftime("%Y-%m-%dT00:00:00")
        result["date_to"] = last_day.strftime("%Y-%m-%dT23:59:59")
        return result

    # Past month (last 30 days)
    if "past month" in expression_lower or "last month" in expression_lower:
        thirty_days_ago = now - timedelta(days=30)

        result["success"] = True
        result["expression_type"] = "past_month"
        result["date_from"] = thirty_days_ago.strftime("%Y-%m-%dT00:00:00")
        result["date_to"] = now.strftime("%Y-%m-%dT23:59:59")
        return result

    # Past week (last 7 days)
    if "past 7 days" in expression_lower or "last 7 days" in expression_lower:
        seven_days_ago = now - timedelta(days=7)

        result["success"] = True
        result["expression_type"] = "past_7_days"
        result["date_from"] = seven_days_ago.strftime("%Y-%m-%dT00:00:00")
        result["date_to"] = now.strftime("%Y-%m-%dT23:59:59")
        return result

    return result


def parse_query_date_filters(user_message: str) -> Dict[str, Any]:
    """
    Extract date range filters from a natural language query.

    Args:
        user_message: User's query message

    Returns:
        Dictionary with date_from, date_to, and other query filters
    """
    result = {
        "success": False,
        "date_from": None,
        "date_to": None,
        "priority": None,
        "status": None,
        "tag_filter": None,
        "is_overdue": False,
        "expressions_found": [],
    }

    message_lower = user_message.lower()

    # Check for overdue
    if "overdue" in message_lower:
        result["is_overdue"] = True
        result["expressions_found"].append("overdue")

    # Check for date range expressions
    date_expressions = [
        "this week", "next week", "last week", "past week",
        "this month", "next month", "last month", "past month",
        "today", "tomorrow", "past 7 days", "last 7 days"
    ]

    for expr in date_expressions:
        if expr in message_lower:
            range_result = get_date_range_for_expression(expr)
            if range_result.get("success"):
                result["date_from"] = range_result["date_from"]
                result["date_to"] = range_result["date_to"]
                result["expressions_found"].append(expr)
                result["success"] = True
                break

    # Check for priority filters
    priority_patterns = [
        (r"high\s*priority", "high"),
        (r"urgent\s*(tasks)?", "high"),
        (r"medium\s*priority", "medium"),
        (r"low\s*priority", "low"),
    ]

    for pattern, priority in priority_patterns:
        if re.search(pattern, message_lower):
            result["priority"] = priority
            result["success"] = True
            break

    # Check for status filters
    if "completed" in message_lower or "done" in message_lower:
        result["status"] = "completed"
        result["success"] = True
    elif "in progress" in message_lower or "in_progress" in message_lower:
        result["status"] = "in_progress"
        result["success"] = True
    elif "pending" in message_lower or "active" in message_lower:
        result["status"] = "pending"
        result["success"] = True

    # Check for tag filters
    tag_patterns = [
        r"tagged?\s+(\w+)",
        r"with\s+(?:the\s+)?(\w+)\s+tag",
        r"tag:\s*(\w+)",
    ]

    for pattern in tag_patterns:
        match = re.search(pattern, message_lower)
        if match:
            result["tag_filter"] = match.group(1)
            result["success"] = True
            break

    return result
