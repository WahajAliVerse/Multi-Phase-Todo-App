"""
Natural Language Recurrence Pattern Parser

Parses natural language expressions into structured recurrence patterns.
Supports daily, weekly, monthly, yearly frequencies with end conditions.
"""

import re
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple
from enum import Enum

from ..logger import agent_logger


class Frequency(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class EndCondition(Enum):
    NEVER = "never"
    AFTER = "after"
    ON_DATE = "on_date"


# Day name mappings
DAY_NAMES = {
    "monday": "mon", "mon": "mon",
    "tuesday": "tue", "tue": "tue", "tues": "tue",
    "wednesday": "wed", "wed": "wed",
    "thursday": "thu", "thu": "thu", "thur": "thu", "thurs": "thu",
    "friday": "fri", "fri": "fri",
    "saturday": "sat", "sat": "sat",
    "sunday": "sun", "sun": "sun",
}

WEEKDAY_NAMES = {"mon", "tue", "wed", "thu", "fri"}
WEEKEND_NAMES = {"sat", "sun"}

MONTH_NAMES = {
    "january": 1, "jan": 1,
    "february": 2, "feb": 2,
    "march": 3, "mar": 3,
    "april": 4, "apr": 4,
    "may": 5,
    "june": 6, "jun": 6,
    "july": 7, "jul": 7,
    "august": 8, "aug": 8,
    "september": 9, "sep": 9, "sept": 9,
    "october": 10, "oct": 10,
    "november": 11, "nov": 11,
    "december": 12, "dec": 12,
}

# Ordinal number mappings
ORDINALS = {
    "first": 1, "1st": 1, "1": 1,
    "second": 2, "2nd": 2, "2": 2,
    "third": 3, "3rd": 3, "3": 3,
    "fourth": 4, "4th": 4, "4": 4,
    "fifth": 5, "5th": 5, "5": 5,
    "sixth": 6, "6th": 6, "6": 6,
    "seventh": 7, "7th": 7, "7": 7,
    "eighth": 8, "8th": 8, "8": 8,
    "ninth": 9, "9th": 9, "9": 9,
    "tenth": 10, "10th": 10, "10": 10,
    "eleventh": 11, "11th": 11, "11": 11,
    "twelfth": 12, "12th": 12, "12": 12,
    "thirteenth": 13, "13th": 13, "13": 13,
    "fourteenth": 14, "14th": 14, "14": 14,
    "fifteenth": 15, "15th": 15, "15": 15,
    "sixteenth": 16, "16th": 16, "16": 16,
    "seventeenth": 17, "17th": 17, "17": 17,
    "eighteenth": 18, "18th": 18, "18": 18,
    "nineteenth": 19, "19th": 19, "19": 19,
    "twentieth": 20, "20th": 20, "20": 20,
    "twenty-first": 21, "21st": 21, "21": 21,
    "twenty-second": 22, "22nd": 22, "22": 22,
    "twenty-third": 23, "23rd": 23, "23": 23,
    "twenty-fourth": 24, "24th": 24, "24": 24,
    "twenty-fifth": 25, "25th": 25, "25": 25,
    "twenty-sixth": 26, "26th": 26, "26": 26,
    "twenty-seventh": 27, "27th": 27, "27": 27,
    "twenty-eighth": 28, "28th": 28, "28": 28,
    "twenty-ninth": 29, "29th": 29, "29": 29,
    "thirtieth": 30, "30th": 30, "30": 30,
    "thirty-first": 31, "31st": 31, "31": 31,
}


def parse_recurrence_pattern(text: str, reference_date: datetime = None) -> Dict[str, Any]:
    """
    Parse natural language recurrence pattern into structured format.

    Args:
        text: Natural language expression (e.g., "every Monday at 10am")
        reference_date: Base date for calculations (default: now)

    Returns:
        Dictionary with parsed recurrence pattern components
    """
    if reference_date is None:
        reference_date = datetime.now()

    result = {
        "success": False,
        "frequency": None,
        "interval": 1,
        "days_of_week": None,
        "day_of_month": None,
        "end_condition": "never",
        "end_after_occurrences": None,
        "end_date": None,
        "start_date": None,
        "time": None,
        "confidence": 0.0,
        "original": text,
    }

    text_lower = text.lower().strip()

    # Parse frequency pattern
    frequency_result = _parse_frequency(text_lower, reference_date)
    if frequency_result:
        result["frequency"] = frequency_result["frequency"]
        result["interval"] = frequency_result.get("interval", 1)
        result["days_of_week"] = frequency_result.get("days_of_week")
        result["day_of_month"] = frequency_result.get("day_of_month")
        result["confidence"] += frequency_result.get("confidence", 0.3)

    # Parse time
    time_result = _parse_time(text_lower)
    if time_result:
        result["time"] = time_result["time"]
        result["confidence"] += 0.2

    # Parse start date
    start_result = _parse_start_date(text_lower, reference_date)
    if start_result:
        result["start_date"] = start_result["start_date"]
        result["confidence"] += 0.15

    # Parse end condition
    end_result = _parse_end_condition(text_lower, reference_date)
    if end_result:
        result["end_condition"] = end_result["end_condition"]
        result["end_after_occurrences"] = end_result.get("end_after_occurrences")
        result["end_date"] = end_result.get("end_date")
        result["confidence"] += 0.15

    result["success"] = result["frequency"] is not None and result["confidence"] >= 0.4

    agent_logger.debug(f"Parsed recurrence: {text} -> {result}")
    return result


def _parse_frequency(text: str, reference_date: datetime) -> Optional[Dict[str, Any]]:
    """Parse frequency pattern from text."""
    result = {"frequency": None, "interval": 1, "confidence": 0.0}

    # Daily patterns
    daily_patterns = [
        r"\b(daily|every\s+day)\b",
        r"\bevery\s+(\d+)\s+days?\b",
    ]

    for pattern in daily_patterns:
        match = re.search(pattern, text)
        if match:
            result["frequency"] = "daily"
            if match.group(1) and match.group(1).isdigit():
                result["interval"] = int(match.group(1))
            result["confidence"] = 0.9
            return result

    # Weekly patterns
    weekly_patterns = [
        r"\b(weekly|every\s+week)\b",
        r"\bevery\s+(\d+)\s+weeks?\b",
        r"\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b",
        r"\bevery\s+(weekday|weekdays)\b",
        r"\bevery\s+(weekend)\b",
        r"\b(on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)(\s+at|\s*,|\s*$)\b",
        r"\bevery\s+(\d+)\s+weeks?\s+on\s+(\w+)\b",
    ]

    for pattern in weekly_patterns:
        match = re.search(pattern, text)
        if match:
            result["frequency"] = "weekly"
            result["confidence"] = 0.85

            # Check for interval
            interval_match = re.search(r"every\s+(\d+)\s+weeks?", text)
            if interval_match:
                result["interval"] = int(interval_match.group(1))

            # Check for specific days
            if "weekday" in text or "weekdays" in text:
                result["days_of_week"] = ["mon", "tue", "wed", "thu", "fri"]
                result["confidence"] = 0.9
            elif "weekend" in text:
                result["days_of_week"] = ["sat", "sun"]
                result["confidence"] = 0.9
            else:
                days = _extract_days_of_week(text)
                if days:
                    result["days_of_week"] = days
                    result["confidence"] = 0.9

            return result

    # Monthly patterns
    monthly_patterns = [
        r"\b(monthly|every\s+month)\b",
        r"\bevery\s+(\d+)\s+months?\b",
        r"\b(on\s+the\s+)?(\d+(?:st|nd|rd|th)?)\s+(of\s+each\s+month|every\s+month)\b",
        r"\bevery\s+month\s+on\s+the\s+(\d+(?:st|nd|rd|th)?)\b",
        r"\bon\s+the\s+(\d+(?:st|nd|rd|th)?)\s+of\s+each\s+month\b",
    ]

    for pattern in monthly_patterns:
        match = re.search(pattern, text)
        if match:
            result["frequency"] = "monthly"
            result["confidence"] = 0.85

            # Check for interval
            interval_match = re.search(r"every\s+(\d+)\s+months?", text)
            if interval_match:
                result["interval"] = int(interval_match.group(1))

            # Check for day of month
            day_match = re.search(r"(\d+(?:st|nd|rd|th)?)", text)
            if day_match:
                day_str = day_match.group(1)
                day = _parse_ordinal(day_str)
                if day and 1 <= day <= 31:
                    result["day_of_month"] = day
                    result["confidence"] = 0.9

            return result

    # Yearly patterns
    yearly_patterns = [
        r"\b(yearly|annually|every\s+year)\b",
        r"\bevery\s+(\d+)\s+years?\b",
        r"\bevery\s+year\s+on\s+",
        r"\bannually\s+on\s+",
    ]

    for pattern in yearly_patterns:
        match = re.search(pattern, text)
        if match:
            result["frequency"] = "yearly"
            result["confidence"] = 0.85

            # Check for interval
            interval_match = re.search(r"every\s+(\d+)\s+years?", text)
            if interval_match:
                result["interval"] = int(interval_match.group(1))

            return result

    return result if result["frequency"] else None


def _extract_days_of_week(text: str) -> List[str]:
    """Extract days of week from text."""
    days = []
    text_lower = text.lower()

    for full_name, abbrev in DAY_NAMES.items():
        # Check for day name with word boundaries
        if re.search(rf"\b{full_name}\b", text_lower) or re.search(rf"\b{abbrev}\b", text_lower):
            if abbrev not in days:
                days.append(abbrev)

    return days


def _parse_ordinal(day_str: str) -> Optional[int]:
    """Parse ordinal day string to integer."""
    day_str = day_str.lower().strip()

    # Check direct ordinal mapping
    if day_str in ORDINALS:
        return ORDINALS[day_str]

    # Extract number from string like "15th", "1st", etc.
    match = re.match(r"(\d+)", day_str)
    if match:
        num = int(match.group(1))
        if 1 <= num <= 31:
            return num

    return None


def _parse_time(text: str) -> Optional[Dict[str, str]]:
    """Parse time expression from text."""
    # Common time patterns
    time_patterns = [
        r"\bat\s+(\d{1,2})\s*(am|pm)\b",  # at 10am, at 5pm
        r"\bat\s+(\d{1,2}):(\d{2})\s*(am|pm)?\b",  # at 10:30, at 10:30am
        r"\b(\d{1,2})\s*(am|pm)\b",  # 10am, 5pm
        r"\b(\d{1,2}):(\d{2})\s*(am|pm)?\b",  # 10:30, 10:30am
    ]

    for pattern in time_patterns:
        match = re.search(pattern, text)
        if match:
            groups = match.groups()

            if len(groups) >= 3 and groups[2]:  # Has minutes
                hour = int(groups[0])
                minute = int(groups[1])
                period = groups[2].lower() if groups[2] else None
            elif len(groups) >= 2 and groups[1]:  # Has am/pm
                hour = int(groups[0])
                minute = 0
                period = groups[1].lower()
            else:
                continue

            # Convert to 24-hour format
            if period:
                if period == "pm" and hour != 12:
                    hour += 12
                elif period == "am" and hour == 12:
                    hour = 0

            time_str = f"{hour:02d}:{minute:02d}"
            return {"time": time_str}

    # Relative times
    relative_times = {
        "morning": "09:00",
        "afternoon": "14:00",
        "evening": "18:00",
        "night": "20:00",
        "noon": "12:00",
        "midnight": "00:00",
    }

    for rel_time, time_str in relative_times.items():
        if rel_time in text:
            return {"time": time_str}

    return None


def _parse_start_date(text: str, reference_date: datetime) -> Optional[Dict[str, str]]:
    """Parse start date expression from text."""
    # Starting patterns
    start_patterns = [
        r"\bstarting\s+(.+?)(?:\s+until|\s+for|$)\b",
        r"\bbeginning\s+(.+?)(?:\s+until|\s+for|$)\b",
        r"\bfrom\s+(.+?)(?:\s+until|\s+for|$)\b",
        r"\bas\s+of\s+(.+?)(?:\s+until|\s+for|$)\b",
    ]

    for pattern in start_patterns:
        match = re.search(pattern, text)
        if match:
            start_expr = match.group(1).strip()
            start_date = _parse_date_expression(start_expr, reference_date)
            if start_date:
                return {"start_date": start_date}

    # "Next week" as start
    if "starting next week" in text or "beginning next week" in text:
        # Calculate next Monday
        days_until_monday = (7 - reference_date.weekday()) % 7
        if days_until_monday == 0:
            days_until_monday = 7
        next_monday = reference_date + timedelta(days=days_until_monday)
        return {"start_date": next_monday.strftime("%Y-%m-%d")}

    # "Next month" as start
    if "starting next month" in text or "beginning next month" in text:
        if reference_date.month == 12:
            next_month = reference_date.replace(year=reference_date.year + 1, month=1, day=1)
        else:
            next_month = reference_date.replace(month=reference_date.month + 1, day=1)
        return {"start_date": next_month.strftime("%Y-%m-%d")}

    return None


def _parse_end_condition(text: str, reference_date: datetime) -> Optional[Dict[str, Any]]:
    """Parse end condition from text."""
    result = {"end_condition": "never"}

    # "Never" end (default)
    if re.search(r"\b(never|no\s+end|indefinitely)\b", text):
        result["end_condition"] = "never"
        return result

    # "After N occurrences" patterns
    occurrence_patterns = [
        r"\bfor\s+(\d+)\s+(times?|occurrences?)\b",
        r"\b(\d+)\s+(times?|occurrences?)\s+only\b",
        r"\bonly\s+(\d+)\s+(times?|occurrences?)\b",
    ]

    for pattern in occurrence_patterns:
        match = re.search(pattern, text)
        if match:
            count = int(match.group(1))
            result["end_condition"] = "after"
            result["end_after_occurrences"] = count
            return result

    # "Until date" patterns
    until_patterns = [
        r"\buntil\s+(.+?)(?:\s+starting|\s+beginning|$)\b",
        r"\bthrough\s+(.+?)(?:\s+starting|\s+beginning|$)\b",
        r"\bending\s+(.+?)(?:\s+starting|\s+beginning|$)\b",
        r"\bend\s+(.+?)(?:\s+starting|\s+beginning|$)\b",
    ]

    for pattern in until_patterns:
        match = re.search(pattern, text)
        if match:
            date_expr = match.group(1).strip()
            end_date = _parse_date_expression(date_expr, reference_date)
            if end_date:
                result["end_condition"] = "on_date"
                result["end_date"] = end_date
                return result

    # Month name as end date (e.g., "until December")
    for month_name, month_num in MONTH_NAMES.items():
        if re.search(rf"\buntil\s+{month_name}\b", text):
            # Use last day of that month in current or next year
            year = reference_date.year
            if month_num <= reference_date.month:
                year += 1

            # Get last day of month
            if month_num == 12:
                end_date = datetime(year, month_num, 31)
            else:
                end_date = datetime(year, month_num + 1, 1) - timedelta(days=1)

            result["end_condition"] = "on_date"
            result["end_date"] = end_date.strftime("%Y-%m-%d")
            return result

    return result if result["end_condition"] != "never" else None


def _parse_date_expression(date_expr: str, reference_date: datetime) -> Optional[str]:
    """Parse a date expression into ISO format."""
    date_expr = date_expr.lower().strip()

    # Check for month name
    for month_name, month_num in MONTH_NAMES.items():
        if month_name in date_expr:
            year = reference_date.year
            if month_num <= reference_date.month:
                year += 1

            # Try to extract day
            day_match = re.search(r"(\d{1,2})(?:st|nd|rd|th)?", date_expr)
            day = int(day_match.group(1)) if day_match else 1

            try:
                parsed_date = datetime(year, month_num, day)
                return parsed_date.strftime("%Y-%m-%d")
            except ValueError:
                pass

    # Check for relative dates
    if "next week" in date_expr:
        days_until_monday = (7 - reference_date.weekday()) % 7
        if days_until_monday == 0:
            days_until_monday = 7
        next_monday = reference_date + timedelta(days=days_until_monday)
        return next_monday.strftime("%Y-%m-%d")

    if "next month" in date_expr:
        if reference_date.month == 12:
            next_month = reference_date.replace(year=reference_date.year + 1, month=1, day=1)
        else:
            next_month = reference_date.replace(month=reference_date.month + 1, day=1)
        return next_month.strftime("%Y-%m-%d")

    if "end of year" in date_expr or "end of the year" in date_expr:
        return datetime(reference_date.year, 12, 31).strftime("%Y-%m-%d")

    # Try parsing as ISO date
    try:
        parsed = datetime.fromisoformat(date_expr.replace("Z", "+00:00"))
        return parsed.strftime("%Y-%m-%d")
    except ValueError:
        pass

    # Try common date formats
    date_formats = [
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%Y-%m-%d",
        "%B %d, %Y",
        "%b %d, %Y",
    ]

    for fmt in date_formats:
        try:
            parsed = datetime.strptime(date_expr, fmt)
            return parsed.strftime("%Y-%m-%d")
        except ValueError:
            continue

    return None


def format_recurrence_summary(pattern: Dict[str, Any]) -> str:
    """
    Generate human-readable summary of recurrence pattern.

    Args:
        pattern: Parsed recurrence pattern dictionary

    Returns:
        Human-readable summary string
    """
    parts = []

    # Frequency
    frequency = pattern.get("frequency")
    interval = pattern.get("interval", 1)

    if frequency == "daily":
        if interval == 1:
            parts.append("Daily")
        else:
            parts.append(f"Every {interval} days")

    elif frequency == "weekly":
        days = pattern.get("days_of_week")
        if days:
            day_names = {"mon": "Monday", "tue": "Tuesday", "wed": "Wednesday",
                        "thu": "Thursday", "fri": "Friday", "sat": "Saturday", "sun": "Sunday"}
            day_str = ", ".join(day_names.get(d, d) for d in days)

            if set(days) == WEEKDAY_NAMES:
                parts.append("Every weekday")
            elif set(days) == WEEKEND_NAMES:
                parts.append("Every weekend")
            elif len(days) == 1:
                parts.append(f"Every {day_str}")
            else:
                if interval == 1:
                    parts.append(f"Every {day_str}")
                else:
                    parts.append(f"Every {interval} weeks on {day_str}")
        else:
            if interval == 1:
                parts.append("Weekly")
            else:
                parts.append(f"Every {interval} weeks")

    elif frequency == "monthly":
        day = pattern.get("day_of_month")
        if day:
            ordinal = _get_ordinal(day)
            parts.append(f"Monthly on the {ordinal}")
        else:
            if interval == 1:
                parts.append("Monthly")
            else:
                parts.append(f"Every {interval} months")

    elif frequency == "yearly":
        if interval == 1:
            parts.append("Yearly")
        else:
            parts.append(f"Every {interval} years")

    # Time
    time_str = pattern.get("time")
    if time_str:
        time_formatted = _format_time(time_str)
        parts.append(f"at {time_formatted}")

    # Start date
    start_date = pattern.get("start_date")
    if start_date:
        start_formatted = datetime.strptime(start_date, "%Y-%m-%d").strftime("%B %d, %Y")
        parts.append(f"starting {start_formatted}")

    # End condition
    end_condition = pattern.get("end_condition", "never")
    if end_condition == "after":
        occurrences = pattern.get("end_after_occurrences")
        if occurrences:
            parts.append(f"for {occurrences} occurrences")
    elif end_condition == "on_date":
        end_date = pattern.get("end_date")
        if end_date:
            end_formatted = datetime.strptime(end_date, "%Y-%m-%d").strftime("%B %d, %Y")
            parts.append(f"until {end_formatted}")

    return " ".join(parts) if parts else "Recurrence pattern"


def _get_ordinal(n: int) -> str:
    """Get ordinal suffix for a number."""
    if 11 <= n <= 13:
        return f"{n}th"

    suffixes = {1: "st", 2: "nd", 3: "rd"}
    return f"{n}{suffixes.get(n % 10, 'th')}"


def _format_time(time_str: str) -> str:
    """Format 24-hour time to 12-hour format."""
    try:
        hour, minute = map(int, time_str.split(":"))
        period = "AM" if hour < 12 else "PM"

        if hour == 0:
            hour = 12
        elif hour > 12:
            hour -= 12

        if minute == 0:
            return f"{hour}{period}"
        else:
            return f"{hour}:{minute:02d}{period}"
    except (ValueError, AttributeError):
        return time_str


def validate_recurrence_pattern(pattern: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate a parsed recurrence pattern.

    Args:
        pattern: Parsed recurrence pattern dictionary

    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check frequency
    frequency = pattern.get("frequency")
    if not frequency or frequency not in ["daily", "weekly", "monthly", "yearly"]:
        return False, "Invalid frequency. Must be daily, weekly, monthly, or yearly."

    # Check interval
    interval = pattern.get("interval", 1)
    if not isinstance(interval, int) or interval < 1:
        return False, "Interval must be a positive integer."

    # Check days of week for weekly frequency
    if frequency == "weekly":
        days = pattern.get("days_of_week")
        if days:
            valid_days = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"}
            invalid_days = set(days) - valid_days
            if invalid_days:
                return False, f"Invalid days of week: {', '.join(invalid_days)}"

    # Check day of month for monthly frequency
    if frequency == "monthly":
        day = pattern.get("day_of_month")
        if day and (not isinstance(day, int) or day < 1 or day > 31):
            return False, "Day of month must be between 1 and 31."

    # Check end condition
    end_condition = pattern.get("end_condition", "never")
    if end_condition not in ["never", "after", "on_date"]:
        return False, "Invalid end condition. Must be never, after, or on_date."

    # Check end after occurrences
    if end_condition == "after":
        occurrences = pattern.get("end_after_occurrences")
        if not occurrences or not isinstance(occurrences, int) or occurrences < 1:
            return False, "End after occurrences must be a positive integer."

    # Check end date
    if end_condition == "on_date":
        end_date = pattern.get("end_date")
        if not end_date:
            return False, "End date is required when end condition is 'on_date'."

        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            if end_dt < datetime.now():
                return False, "End date must be in the future."
        except ValueError:
            return False, "Invalid end date format. Use YYYY-MM-DD."

    return True, None
