"""
Multi-Context Provider (MCP) Reasoning Module

Handles ambiguous intent clarification using MCP integration with OpenAI Agents SDK.
Provides date ambiguity detection, clarification question generation, and multi-interpretation handling.
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from agents import Agent, Runner
from pydantic import BaseModel, Field
import re

from ..config import logger
from ..logger import agent_logger, log_intent
from ..error_handler import ClarificationNeededError
from ..utils.date_parser import (
    parse_relative_date,
    parse_time_expression,
    parse_natural_date,
    DAY_NAMES,
    RELATIVE_DAYS,
)
from ..utils.recurrence_parser import (
    parse_recurrence_pattern,
    format_recurrence_summary,
    validate_recurrence_pattern,
)


class DateInterpretation(BaseModel):
    """Represents a possible interpretation of an ambiguous date expression."""
    interpretation: str = Field(description="Human-readable interpretation")
    datetime: Optional[str] = Field(default=None, description="ISO 8601 datetime string")
    date: Optional[str] = Field(default=None, description="Date string (YYYY-MM-DD)")
    time: Optional[str] = Field(default=None, description="Time string (HH:MM)")
    confidence: float = Field(description="Confidence score for this interpretation")
    is_ambiguous: bool = Field(default=False, description="Whether this interpretation is ambiguous")


class IntentResult(BaseModel):
    """Parsed intent with confidence and entities."""
    intent_type: str = Field(description="Type of intent (e.g., create_task, update_task)")
    confidence: float = Field(description="Confidence score 0.0 to 1.0")
    entities: Dict[str, Any] = Field(default_factory=dict, description="Extracted entities")
    requires_clarification: bool = Field(default=False, description="Whether clarification is needed")
    clarification_questions: List[str] = Field(default_factory=list, description="Questions to ask user")
    date_interpretations: List[DateInterpretation] = Field(
        default_factory=list,
        description="Multiple possible date interpretations when ambiguous"
    )
    selected_interpretation: Optional[DateInterpretation] = Field(
        default=None,
        description="Selected date interpretation after clarification"
    )


class ClarificationResult(BaseModel):
    """Clarification response from MCP."""
    is_clear: bool = Field(description="Whether intent is now clear")
    answers: Dict[str, str] = Field(default_factory=dict, description="User's answers")
    refined_intent: Optional[str] = Field(default=None, description="Refined intent type")
    selected_date_interpretation: Optional[int] = Field(
        default=None,
        description="Index of selected date interpretation (0-based)"
    )


# MCP Agent for intent parsing
intent_parser_agent = Agent(
    name="IntentParser",
    instructions="""You are an expert at parsing natural language intents for task management.

Supported intent types:
- create_task: Create a new task
- update_task: Modify an existing task (due date, priority, title, description, status)
- delete_task: Remove a task
- query_tasks: Search/filter tasks
- create_tag: Create a new tag
- update_tag: Update an existing tag (rename, change color)
- delete_tag: Delete a tag
- get_tags: List/query tags
- assign_tag: Assign tag to task
- create_recurring: Create recurring task pattern
- update_recurrence: Update existing recurrence pattern
- cancel_recurrence: Cancel recurring task pattern
- schedule_reminder: Schedule task reminder
- query_reminders: List/query reminders

Extract entities like:
- title: Task title/description
- due_date: When task is due (ISO 8601 format if specific, or raw expression if ambiguous)
- priority: low, medium, high
- status: pending, in_progress, completed
- tag_name: Tag name
- tag_id: Tag identifier
- color: Tag color (hex or named: red, blue, green, yellow, orange, purple, pink)
- recurrence_pattern: Natural language recurrence pattern (e.g., "every Monday at 10am")
- recurrence_frequency: daily, weekly, monthly, yearly
- recurrence_interval: How often (e.g., 1, 2, 3)
- recurrence_days: Days of week for weekly patterns (mon, tue, wed, thu, fri, sat, sun)
- recurrence_day_of_month: Day of month for monthly patterns (1-31)
- recurrence_end: End condition (never, after N times, until date)
- task_id: Task identifier for updates/deletes
- task_reference: Reference to task by name (e.g., "dentist appointment", "buy groceries")
- updates: Dictionary of fields to update for update_task/update_tag intent
- recurrence_id: Recurrence pattern UUID for update/cancel operations
- new_name: New name for rename operations
- reminder_time: When to trigger reminder (ISO 8601 or natural language)
- reminder_offset: Offset before event (e.g., "30 minutes before", "1 hour before")
- delivery_method: How to deliver reminder (browser, email, push)
- reminder_message: Custom reminder message

REMINDER PATTERNS:
- "Remind me 30 minutes before my meeting" → schedule_reminder with reminder_offset
- "Remind me 1 hour before dentist appointment" → schedule_reminder with 1 hour offset
- "Set a reminder for tomorrow at 9am" → schedule_reminder with absolute time
- "Remind me to take medicine every day at 8pm" → schedule_reminder with recurring pattern
- "Remind me via email" → schedule_reminder with delivery_method=email
- "Send push notification" → schedule_reminder with delivery_method=push
- "Browser notification" → schedule_reminder with delivery_method=browser

TAG OPERATION PATTERNS:

CREATE TAG:
- "Create work tag in red" → create_tag with tag_name="work", color="red"
- "Make a red priority tag" → create_tag with tag_name="priority", color="red"
- "Create a blue tag called urgent" → create_tag with tag_name="urgent", color="blue"
- "Add a new tag named meetings in #FF5733" → create_tag with tag_name="meetings", color="#FF5733"
- "Create work tag" → create_tag with tag_name="work", color="blue" (default)

UPDATE TAG:
- "Rename work tag to professional" → update_tag with tag_name="work", updates={"name": "professional"}
- "Change work tag color to green" → update_tag with tag_name="work", updates={"color": "green"}
- "Update the priority tag to be red" → update_tag with tag_name="priority", updates={"color": "red"}
- "Rename urgent to high-priority" → update_tag with tag_name="urgent", updates={"name": "high-priority"}

DELETE TAG:
- "Delete old tag" → delete_tag with tag_name="old"
- "Remove the temporary tag" → delete_tag with tag_name="temporary"
- "Delete the work tag" → delete_tag with tag_name="work"

ASSIGN TAG TO TASK:
- "Add work tag to task" → assign_tag with tag_name="work", task_reference="task" (needs disambiguation)
- "Tag this as urgent" → assign_tag with tag_name="urgent", task_reference="this" (needs context)
- "Add work tag to project tasks" → assign_tag with tag_name="work", task_reference="project tasks" (needs disambiguation)
- "Mark this task with the priority tag" → assign_tag with tag_name="priority", task_reference="this task"
- "Apply the work tag to buy groceries" → assign_tag with tag_name="work", task_reference="buy groceries"

QUERY TAGS:
- "Show my tags" → get_tags
- "What tags do I have" → get_tags
- "List all tags" → get_tags
- "Show me the work tag" → get_tags with tag_name="work"

RECURRING TASK PATTERNS:
- "Weekly team meeting every Monday at 10am starting next week" → create_recurring with weekly pattern
- "Monthly report on the 15th of each month" → create_recurring with monthly pattern
- "Daily standup every weekday at 9am" → create_recurring with daily/weekday pattern
- "Every Monday, Wednesday, Friday" → weekly with specific days
- "For 10 occurrences" → end_condition: after, end_after_occurrences: 10
- "Until December 31" → end_condition: on_date, end_date: 2026-12-31
- "Never ends" → end_condition: never

UPDATE INTENT PATTERNS:
- "Move [task] to [date]" → update_task with due_date
- "Change priority of [task] to [priority]" → update_task with priority
- "Add [tag] tag to [task]" → assign_tag or update_task with tag
- "Reschedule [task]" → update_task with due_date
- "Update [task] title to [new title]" → update_task with title
- "Change recurrence to every Tuesday" → update_recurrence with new pattern

COLOR HANDLING:
- Named colors: red, blue, green, yellow, orange, purple, pink, black, white, gray, cyan, magenta, lime, etc.
- Hex colors: #FF5733, #FFF (short form), #FFFFFF (long form)
- Default color when not specified: blue (#0000FF)

CRITICAL RULES:
1. If date expression is ambiguous (e.g., "next week", "tomorrow at 5pm" without specific date), set confidence < 0.7
2. Flag requires_clarification=true when confidence < 0.7 or critical entities are missing
3. For ambiguous dates, include the raw expression in due_date entity for further processing
4. When user references a task by name (not ID), include task_reference entity with the task name
5. For update_task, extract the 'updates' object with fields: due_date, priority, title, description, status
6. For create_recurring, extract recurrence_pattern as the full natural language expression
7. Always extract as many entities as possible, even if clarification is needed
8. When multiple tasks might match a reference, flag for disambiguation
9. For recurrence patterns, capture the complete pattern description for parsing
10. For tag operations, extract tag_name and color (with default if not specified)
11. For tag assignment, if task_reference is ambiguous, flag for disambiguation
12. For tag rename/update, extract new_name or updates object appropriately

Output must be valid JSON matching IntentResult schema.
""",
    output_type=IntentResult,
)


async def parse_intent(user_message: str, tasks_context: Optional[List[Dict[str, Any]]] = None) -> IntentResult:
    """
    Parse user message to extract intent and entities.

    Args:
        user_message: User's natural language input
        tasks_context: Optional list of user's tasks for disambiguation

    Returns:
        IntentResult with parsed intent, entities, and clarification needs
    """
    try:
        result = await Runner.run(
            intent_parser_agent,
            user_message,
        )

        intent = result.final_output

        # Detect date ambiguities and enhance with interpretations
        if "due_date" in intent.entities:
            date_interpretations = detect_date_ambiguity(intent.entities["due_date"])
            if date_interpretations:
                intent.date_interpretations = date_interpretations
                # If multiple interpretations exist, flag for clarification
                if len(date_interpretations) > 1:
                    intent.requires_clarification = True
                    intent.confidence = min(intent.confidence, 0.6)

        # Handle recurrence pattern parsing
        if intent.intent_type in ["create_recurring", "update_recurrence"]:
            if "recurrence_pattern" in intent.entities:
                # Parse the natural language recurrence pattern
                parsed_recurrence = parse_recurrence_pattern(
                    intent.entities["recurrence_pattern"]
                )
                if parsed_recurrence.get("success"):
                    # Add parsed recurrence details to entities
                    intent.entities["parsed_recurrence"] = parsed_recurrence
                    intent.entities["recurrence_summary"] = format_recurrence_summary(parsed_recurrence)
                    
                    # Validate the parsed pattern
                    is_valid, error_msg = validate_recurrence_pattern(parsed_recurrence)
                    if not is_valid:
                        intent.requires_clarification = True
                        intent.confidence = min(intent.confidence, 0.5)
                        intent.entities["recurrence_error"] = error_msg
                else:
                    # Pattern parsing failed - need clarification
                    intent.requires_clarification = True
                    intent.confidence = min(intent.confidence, 0.4)

        # Handle task reference disambiguation
        if "task_reference" in intent.entities and tasks_context:
            task_matches = find_task_matches(
                intent.entities["task_reference"],
                tasks_context
            )
            if task_matches:
                intent.entities["task_matches"] = task_matches
                # If multiple matches, flag for disambiguation
                if len(task_matches) > 1:
                    intent.requires_clarification = True
                    intent.confidence = min(intent.confidence, 0.5)
                elif len(task_matches) == 1:
                    # Single match - auto-resolve
                    intent.entities["task_id"] = task_matches[0]["id"]
                    intent.entities["matched_task"] = task_matches[0]

        # Handle tag operations
        if intent.intent_type in ["create_tag", "update_tag", "delete_tag", "assign_tag"]:
            # Set default color for tag creation if not specified
            if intent.intent_type == "create_tag" and "color" not in intent.entities:
                intent.entities["color"] = "#0000FF"  # Default blue
            
            # Build updates object for update_tag
            if intent.intent_type == "update_tag":
                intent.entities["updates"] = build_tag_updates_from_entities(intent.entities)
            
            # Handle tag assignment disambiguation
            if intent.intent_type == "assign_tag" and "task_reference" in intent.entities and tasks_context:
                task_matches = find_task_matches(
                    intent.entities["task_reference"],
                    tasks_context
                )
                if task_matches:
                    intent.entities["task_matches"] = task_matches
                    if len(task_matches) > 1:
                        intent.requires_clarification = True
                        intent.confidence = min(intent.confidence, 0.5)
                    elif len(task_matches) == 1:
                        intent.entities["task_id"] = task_matches[0]["id"]
                        intent.entities["matched_task"] = task_matches[0]

        # Handle update intent - build updates object from extracted entities
        if intent.intent_type == "update_task":
            intent.entities["updates"] = build_updates_from_entities(intent.entities)

        # Generate clarification questions if needed
        if detect_ambiguity(intent):
            intent.requires_clarification = True
            if not intent.clarification_questions:
                intent.clarification_questions = generate_clarification_questions(intent)

        # Log intent parsing
        log_intent(
            intent.intent_type,
            intent.confidence,
            intent.requires_clarification
        )

        return intent

    except Exception as e:
        agent_logger.error(f"Intent parsing failed: {e}")
        # Return fallback intent
        return IntentResult(
            intent_type="query_tasks",
            confidence=0.5,
            requires_clarification=True,
            clarification_questions=["Could you rephrase your request?"]
        )


def build_updates_from_entities(entities: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build updates dictionary from extracted entities for update_task intent.

    Args:
        entities: Extracted entities from intent parsing

    Returns:
        Dictionary of fields to update
    """
    updates = {}

    # Map extracted entities to update fields
    if "due_date" in entities:
        updates["due_date"] = entities["due_date"]
    if "priority" in entities:
        updates["priority"] = entities["priority"]
    if "title" in entities:
        updates["title"] = entities["title"]
    if "description" in entities:
        updates["description"] = entities["description"]
    if "status" in entities:
        updates["status"] = entities["status"]
    if "tag_id" in entities:
        # Tag assignment via update
        updates["tag_id"] = entities["tag_id"]
    if "tag_name" in entities:
        updates["tag_name"] = entities["tag_name"]

    return updates


def build_tag_updates_from_entities(entities: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build updates dictionary from extracted entities for update_tag intent.

    Args:
        entities: Extracted entities from intent parsing

    Returns:
        Dictionary of fields to update (name, color)
    """
    updates = {}

    # Map extracted entities to update fields
    if "new_name" in entities:
        updates["name"] = entities["new_name"]
    if "name" in entities and "new_name" not in entities:
        # If only name is present without new_name, check context
        # This handles "rename work to professional" pattern
        pass  # name is used for identifying the tag, not updating
    if "color" in entities:
        updates["color"] = entities["color"]

    return updates


def find_task_matches(
    task_reference: str,
    tasks: List[Dict[str, Any]],
    threshold: float = 0.5
) -> List[Dict[str, Any]]:
    """
    Find tasks matching a reference string.

    Args:
        task_reference: User's reference to a task (e.g., "dentist appointment")
        tasks: List of user's tasks
        threshold: Minimum similarity score

    Returns:
        List of matching tasks with match scores
    """
    from ..utils.task_search import find_multiple_matches

    matches = find_multiple_matches(task_reference, tasks, max_results=5, threshold=threshold)

    # Format matches for clarification
    formatted_matches = []
    for task in matches:
        formatted_matches.append({
            "id": task.get("id"),
            "title": task.get("title"),
            "due_date": task.get("due_date"),
            "priority": task.get("priority"),
            "status": task.get("status"),
        })

    return formatted_matches


async def ask_clarification_questions(
    questions: List[str],
    context: Dict[str, Any]
) -> ClarificationResult:
    """
    Ask clarification questions to resolve ambiguity.

    Args:
        questions: List of clarification questions
        context: Current conversation context

    Returns:
        ClarificationResult with user's answers
    """
    # This would be called after user responds to clarification questions
    # For now, return structure for frontend to handle
    raise ClarificationNeededError(
        questions=questions,
        context=context
    )


def detect_date_ambiguity(date_expression: str) -> List[DateInterpretation]:
    """
    Detect ambiguous date expressions and generate multiple interpretations.

    Handles expressions like:
    - "next week" (could be next Monday or 7 days from now)
    - "tomorrow at 5pm" (clear date but needs time confirmation)
    - "Friday" (could be this Friday or next Friday)
    - "in a few days" (vague relative expression)

    Args:
        date_expression: Natural language date expression

    Returns:
        List of DateInterpretation objects (empty if no ambiguity detected)
    """
    if not date_expression:
        return []

    expression_lower = date_expression.lower().strip()
    interpretations: List[DateInterpretation] = []
    now = datetime.now()

    # Check for ambiguous relative expressions
    ambiguous_patterns = [
        (r"next\s+week", _interpret_next_week),
        (r"next\s+month", _interpret_next_month),
        (r"this\s+week", _interpret_this_week),
        (r"this\s+weekend", _interpret_weekend),
        (r"next\s+\w+", _interpret_next_day),  # next Monday, next Friday
        (r"\w+day", _interpret_day_of_week),  # Monday, Friday
        (r"in\s+\d+\s+days?", _interpret_in_days),
        (r"in\s+a\s+few\s+days?", _interpret_in_few_days),
        (r"tomorrow\s+at\s+\d", _interpret_tomorrow_time),
        (r"today\s+at\s+\d", _interpret_today_time),
    ]

    for pattern, interpreter in ambiguous_patterns:
        if re.search(pattern, expression_lower):
            interpretations = interpreter(expression_lower, now)
            if interpretations:
                break

    # If no specific pattern matched, try general parsing
    if not interpretations:
        parsed = parse_natural_date(date_expression)
        if parsed.get("success"):
            interpretations.append(DateInterpretation(
                interpretation=f"Parsed date: {parsed.get('date', 'unknown')}",
                datetime=parsed.get("datetime"),
                date=parsed.get("date"),
                time=parsed.get("time"),
                confidence=parsed.get("confidence", 0.5),
                is_ambiguous=parsed.get("confidence", 0.5) < 0.7
            ))

    return interpretations


def _interpret_next_week(expression: str, now: datetime) -> List[DateInterpretation]:
    """Interpret 'next week' expressions."""
    interpretations = []

    # Interpretation 1: Next Monday
    days_until_monday = (7 - now.weekday()) % 7
    if days_until_monday == 0:
        days_until_monday = 7
    next_monday = now + timedelta(days=days_until_monday)

    interpretations.append(DateInterpretation(
        interpretation=f"Next Monday ({next_monday.strftime('%Y-%m-%d')})",
        date=next_monday.strftime("%Y-%m-%d"),
        datetime=next_monday.strftime("%Y-%m-%dT09:00:00"),
        confidence=0.7,
        is_ambiguous=True
    ))

    # Interpretation 2: 7 days from now
    seven_days = now + timedelta(days=7)
    interpretations.append(DateInterpretation(
        interpretation=f"7 days from now ({seven_days.strftime('%Y-%m-%d')})",
        date=seven_days.strftime("%Y-%m-%d"),
        datetime=seven_days.strftime("%Y-%m-%dT09:00:00"),
        confidence=0.6,
        is_ambiguous=True
    ))

    return interpretations


def _interpret_next_month(expression: str, now: datetime) -> List[DateInterpretation]:
    """Interpret 'next month' expressions."""
    interpretations = []

    # First day of next month
    if now.month == 12:
        next_month = now.replace(year=now.year + 1, month=1, day=1)
    else:
        next_month = now.replace(month=now.month + 1, day=1)

    interpretations.append(DateInterpretation(
        interpretation=f"First of next month ({next_month.strftime('%Y-%m-%d')})",
        date=next_month.strftime("%Y-%m-%d"),
        datetime=next_month.strftime("%Y-%m-%dT09:00:00"),
        confidence=0.65,
        is_ambiguous=True
    ))

    return interpretations


def _interpret_this_week(expression: str, now: datetime) -> List[DateInterpretation]:
    """Interpret 'this week' expressions."""
    interpretations = []

    # This Monday
    days_since_monday = now.weekday()
    this_monday = now - timedelta(days=days_since_monday)

    interpretations.append(DateInterpretation(
        interpretation=f"This Monday ({this_monday.strftime('%Y-%m-%d')})",
        date=this_monday.strftime("%Y-%m-%d"),
        datetime=this_monday.strftime("%Y-%m-%dT09:00:00"),
        confidence=0.65,
        is_ambiguous=True
    ))

    # End of week (Sunday)
    this_sunday = this_monday + timedelta(days=6)
    interpretations.append(DateInterpretation(
        interpretation=f"End of week ({this_sunday.strftime('%Y-%m-%d')})",
        date=this_sunday.strftime("%Y-%m-%d"),
        datetime=this_sunday.strftime("%Y-%m-%dT23:59:00"),
        confidence=0.5,
        is_ambiguous=True
    ))

    return interpretations


def _interpret_weekend(expression: str, now: datetime) -> List[DateInterpretation]:
    """Interpret 'weekend' expressions."""
    interpretations = []

    # This Saturday
    days_until_saturday = (5 - now.weekday()) % 7
    if days_until_saturday == 0 and now.hour > 12:
        days_until_saturday = 7
    this_saturday = now + timedelta(days=days_until_saturday)

    interpretations.append(DateInterpretation(
        interpretation=f"This Saturday ({this_saturday.strftime('%Y-%m-%d')})",
        date=this_saturday.strftime("%Y-%m-%d"),
        datetime=this_saturday.strftime("%Y-%m-%dT10:00:00"),
        confidence=0.6,
        is_ambiguous=True
    ))

    # This Sunday
    this_sunday = this_saturday + timedelta(days=1)
    interpretations.append(DateInterpretation(
        interpretation=f"This Sunday ({this_sunday.strftime('%Y-%m-%d')})",
        date=this_sunday.strftime("%Y-%m-%d"),
        datetime=this_sunday.strftime("%Y-%m-%dT10:00:00"),
        confidence=0.6,
        is_ambiguous=True
    ))

    return interpretations


def _interpret_next_day(expression: str, now: datetime) -> List[DateInterpretation]:
    """Interpret 'next [day]' expressions (e.g., next Monday)."""
    interpretations = []

    for day_name, weekday in DAY_NAMES.items():
        if day_name in expression:
            # Next occurrence of this day
            days_ahead = weekday - now.weekday()
            if days_ahead <= 0:  # Already happened this week, go to next week
                days_ahead += 7

            next_day = now + timedelta(days=days_ahead)
            interpretations.append(DateInterpretation(
                interpretation=f"Next {day_name.capitalize()} ({next_day.strftime('%Y-%m-%d')})",
                date=next_day.strftime("%Y-%m-%d"),
                datetime=next_day.strftime("%Y-%m-%dT09:00:00"),
                confidence=0.75,
                is_ambiguous=False
            ))
            break

    return interpretations


def _interpret_day_of_week(expression: str, now: datetime) -> List[DateInterpretation]:
    """Interpret day of week expressions (e.g., 'Friday')."""
    interpretations = []

    for day_name, weekday in DAY_NAMES.items():
        if day_name in expression:
            # This occurrence of the day
            days_ahead = weekday - now.weekday()

            if days_ahead < 0:
                # Already happened this week, interpret as next week
                days_ahead += 7
                future_day = now + timedelta(days=days_ahead)
                interpretations.append(DateInterpretation(
                    interpretation=f"Next {day_name.capitalize()} ({future_day.strftime('%Y-%m-%d')})",
                    date=future_day.strftime("%Y-%m-%d"),
                    datetime=future_day.strftime("%Y-%m-%dT09:00:00"),
                    confidence=0.7,
                    is_ambiguous=False
                ))
            elif days_ahead == 0:
                # Today is that day - could mean today or next week
                today = now
                next_week = now + timedelta(days=7)

                interpretations.append(DateInterpretation(
                    interpretation=f"Today ({today.strftime('%Y-%m-%d')})",
                    date=today.strftime("%Y-%m-%d"),
                    datetime=today.strftime("%Y-%m-%dT09:00:00"),
                    confidence=0.6,
                    is_ambiguous=True
                ))
                interpretations.append(DateInterpretation(
                    interpretation=f"Next week ({next_week.strftime('%Y-%m-%d')})",
                    date=next_week.strftime("%Y-%m-%d"),
                    datetime=next_week.strftime("%Y-%m-%dT09:00:00"),
                    confidence=0.5,
                    is_ambiguous=True
                ))
            else:
                # This week
                future_day = now + timedelta(days=days_ahead)
                interpretations.append(DateInterpretation(
                    interpretation=f"This {day_name.capitalize()} ({future_day.strftime('%Y-%m-%d')})",
                    date=future_day.strftime("%Y-%m-%d"),
                    datetime=future_day.strftime("%Y-%m-%dT09:00:00"),
                    confidence=0.75,
                    is_ambiguous=False
                ))
            break

    return interpretations


def _interpret_in_days(expression: str, now: datetime) -> List[DateInterpretation]:
    """Interpret 'in X days' expressions."""
    interpretations = []

    match = re.search(r"(\d+)", expression)
    if match:
        days = int(match.group(1))
        future_date = now + timedelta(days=days)

        interpretations.append(DateInterpretation(
            interpretation=f"In {days} days ({future_date.strftime('%Y-%m-%d')})",
            date=future_date.strftime("%Y-%m-%d"),
            datetime=future_date.strftime("%Y-%m-%dT09:00:00"),
            confidence=0.85,
            is_ambiguous=False
        ))

    return interpretations


def _interpret_in_few_days(expression: str, now: datetime) -> List[DateInterpretation]:
    """Interpret 'in a few days' expressions."""
    interpretations = []

    # "A few" typically means 3-4 days
    for days in [3, 4]:
        future_date = now + timedelta(days=days)
        interpretations.append(DateInterpretation(
            interpretation=f"In {days} days ({future_date.strftime('%Y-%m-%d')})",
            date=future_date.strftime("%Y-%m-%d"),
            datetime=future_date.strftime("%Y-%m-%dT09:00:00"),
            confidence=0.5 if days == 4 else 0.6,
            is_ambiguous=True
        ))

    return interpretations


def _interpret_tomorrow_time(expression: str, now: datetime) -> List[DateInterpretation]:
    """Interpret 'tomorrow at X' expressions."""
    interpretations = []

    tomorrow = now + timedelta(days=1)
    time_str = parse_time_expression(expression)

    if time_str:
        hour, minute = map(int, time_str.split(":"))
        tomorrow_time = tomorrow.replace(hour=hour, minute=minute, second=0)

        interpretations.append(DateInterpretation(
            interpretation=f"Tomorrow at {time_str} ({tomorrow_time.strftime('%Y-%m-%d %H:%M')})",
            date=tomorrow.strftime("%Y-%m-%d"),
            time=time_str,
            datetime=tomorrow_time.isoformat(),
            confidence=0.85,
            is_ambiguous=False
        ))
    else:
        interpretations.append(DateInterpretation(
            interpretation=f"Tomorrow ({tomorrow.strftime('%Y-%m-%d')})",
            date=tomorrow.strftime("%Y-%m-%d"),
            datetime=tomorrow.strftime("%Y-%m-%dT09:00:00"),
            confidence=0.75,
            is_ambiguous=False
        ))

    return interpretations


def _interpret_today_time(expression: str, now: datetime) -> List[DateInterpretation]:
    """Interpret 'today at X' expressions."""
    interpretations = []

    today = now
    time_str = parse_time_expression(expression)

    if time_str:
        hour, minute = map(int, time_str.split(":"))
        today_time = today.replace(hour=hour, minute=minute, second=0)

        # If time has already passed, flag as potentially meaning tomorrow
        if today_time < now:
            tomorrow = now + timedelta(days=1)
            tomorrow_time = tomorrow.replace(hour=hour, minute=minute, second=0)

            interpretations.append(DateInterpretation(
                interpretation=f"Today at {time_str} ({today_time.strftime('%Y-%m-%d %H:%M')})",
                date=today.strftime("%Y-%m-%d"),
                time=time_str,
                datetime=today_time.isoformat(),
                confidence=0.6,
                is_ambiguous=True
            ))
            interpretations.append(DateInterpretation(
                interpretation=f"Tomorrow at {time_str} ({tomorrow_time.strftime('%Y-%m-%d %H:%M')})",
                date=tomorrow.strftime("%Y-%m-%d"),
                time=time_str,
                datetime=tomorrow_time.isoformat(),
                confidence=0.7,
                is_ambiguous=True
            ))
        else:
            interpretations.append(DateInterpretation(
                interpretation=f"Today at {time_str} ({today_time.strftime('%Y-%m-%d %H:%M')})",
                date=today.strftime("%Y-%m-%d"),
                time=time_str,
                datetime=today_time.isoformat(),
                confidence=0.85,
                is_ambiguous=False
            ))

    return interpretations


def detect_ambiguity(intent: IntentResult) -> bool:
    """
    Detect if intent requires clarification.

    Args:
        intent: Parsed intent

    Returns:
        True if clarification needed
    """
    # Already flagged for clarification
    if intent.requires_clarification:
        return True

    # Low confidence
    if intent.confidence < 0.7:
        return True

    # Multiple date interpretations exist
    if len(intent.date_interpretations) > 1:
        return True

    # Check for ambiguous date interpretations
    for interpretation in intent.date_interpretations:
        if interpretation.is_ambiguous:
            return True

    # Missing critical entities
    critical_entities = {
        "create_task": ["title"],
        "update_task": ["task_id", "updates"],
        "delete_task": ["task_id"],
        "assign_tag": ["tag_id", "task_id"],
        "create_recurring": ["task_id", "pattern"],
        "schedule_reminder": ["task_id", "reminder_time"],
    }

    required = critical_entities.get(intent.intent_type, [])
    for entity in required:
        if entity not in intent.entities:
            return True

    # Check for task_reference without task_id (user referenced task by name)
    if "task_reference" in intent.entities and "task_id" not in intent.entities:
        return True

    return False


def generate_clarification_questions(intent: IntentResult) -> List[str]:
    """
    Generate clarification questions based on missing information.

    Args:
        intent: Parsed intent with missing entities

    Returns:
        List of clarification questions
    """
    questions = []

    # Handle task disambiguation first (multiple matches)
    if "task_matches" in intent.entities and len(intent.entities["task_matches"]) > 1:
        matches = intent.entities["task_matches"]
        task_list = "\n".join([
            f"  {i+1}. \"{t['title']}\" (Due: {t.get('due_date', 'No date')}, Priority: {t.get('priority', 'N/A')})"
            for i, t in enumerate(matches[:5])  # Show max 5 matches
        ])
        questions.append(f"I found multiple tasks matching \"{intent.entities.get('task_reference', 'your description')}\":\n{task_list}\n\nWhich one did you mean? (reply with number)")

    # Handle date ambiguities
    if intent.date_interpretations:
        if len(intent.date_interpretations) > 1:
            # Present options to user
            options = " or ".join([
                f"{i+1}) {interp.interpretation}"
                for i, interp in enumerate(intent.date_interpretations)
            ])
            questions.append(f"When exactly? Choose: {options}")
        elif intent.date_interpretations[0].is_ambiguous:
            interp = intent.date_interpretations[0]
            questions.append(f"Did you mean {interp.interpretation}?")

    if intent.intent_type == "create_task":
        if "title" not in intent.entities:
            questions.append("What would you like to call this task?")
        if "due_date" in intent.entities and not intent.date_interpretations:
            # Check for ambiguous date expressions
            due_date = str(intent.entities.get("due_date", "")).lower()
            if any(pattern in due_date for pattern in ["next week", "next month", "friday", "monday"]):
                questions.append(f"You mentioned '{intent.entities['due_date']}' - could you specify the exact date?")
        if "priority" not in intent.entities:
            # Don't ask for priority - use default
            pass

    elif intent.intent_type == "update_task":
        if "task_id" not in intent.entities and "task_matches" not in intent.entities:
            if "task_reference" in intent.entities:
                questions.append(f"Which task are you referring to when you say '{intent.entities['task_reference']}'?")
            else:
                questions.append("Which task would you like to update?")
        if "updates" not in intent.entities or not intent.entities.get("updates"):
            # Check if we have any update fields extracted
            has_update = any(k in intent.entities for k in ["due_date", "priority", "title", "description", "status", "tag_name"])
            if not has_update:
                questions.append("What would you like to change about the task?")

    elif intent.intent_type == "delete_task":
        if "task_id" not in intent.entities:
            if "task_reference" in intent.entities:
                questions.append(f"Which task are you referring to when you say '{intent.entities['task_reference']}'?")
            else:
                questions.append("Which task would you like to delete?")

    elif intent.intent_type == "create_recurring":
        if "task_id" not in intent.entities and "task_matches" not in intent.entities:
            if "task_reference" in intent.entities:
                questions.append(f"Which task should be set to repeat when you say '{intent.entities['task_reference']}'?")
            else:
                questions.append("Which task should be set to repeat?")
        if "recurrence_pattern" not in intent.entities and "parsed_recurrence" not in intent.entities:
            questions.append("How often should this task repeat? (e.g., 'every Monday', 'monthly on the 15th', 'daily')")
        if intent.entities.get("recurrence_error"):
            questions.append(f"There's an issue with the recurrence pattern: {intent.entities['recurrence_error']}. Could you clarify?")
        if "parsed_recurrence" in intent.entities and not intent.entities.get("recurrence_error"):
            # Show summary for confirmation
            summary = intent.entities.get("recurrence_summary", "")
            if summary:
                questions.append(f"Please confirm: {summary}")

    elif intent.intent_type == "update_recurrence":
        if "recurrence_id" not in intent.entities:
            if "task_reference" in intent.entities:
                questions.append(f"Which recurring task's pattern should be updated when you say '{intent.entities['task_reference']}'?")
            else:
                questions.append("Which recurring task pattern should be updated?")
        if "recurrence_pattern" not in intent.entities:
            questions.append("What should the new recurrence pattern be?")

    elif intent.intent_type == "cancel_recurrence":
        if "recurrence_id" not in intent.entities:
            if "task_reference" in intent.entities:
                questions.append(f"Which recurring task should be cancelled when you say '{intent.entities['task_reference']}'?")
            else:
                questions.append("Which recurring task pattern should be cancelled?")
        else:
            questions.append("Are you sure you want to cancel this recurring pattern? Future occurrences will not be created.")

    elif intent.intent_type == "schedule_reminder":
        if "task_id" not in intent.entities:
            questions.append("Which task needs a reminder?")
        if "reminder_time" not in intent.entities:
            questions.append("When should I remind you? (e.g., '30 minutes before', '1 day before')")

    elif intent.intent_type == "assign_tag":
        if "tag_name" not in intent.entities and "tag_id" not in intent.entities:
            questions.append("Which tag would you like to assign?")
        if "task_id" not in intent.entities:
            questions.append("Which task should get this tag?")

    return questions or ["Could you provide more details about what you'd like to do?"]


def format_clarification_response(
    intent: IntentResult,
    questions: List[str]
) -> Dict[str, Any]:
    """
    Format a structured clarification response for the frontend.

    Args:
        intent: Parsed intent with ambiguities
        questions: Generated clarification questions

    Returns:
        Dictionary with clarification data for frontend
    """
    response = {
        "requires_clarification": True,
        "questions": questions,
        "intent_type": intent.intent_type,
        "entities": intent.entities,
    }

    # Include date interpretation options if available
    if intent.date_interpretations:
        response["date_options"] = [
            {
                "index": i,
                "label": interp.interpretation,
                "datetime": interp.datetime,
                "date": interp.date,
                "time": interp.time,
                "confidence": interp.confidence,
            }
            for i, interp in enumerate(intent.date_interpretations)
        ]

    # Include task matches for disambiguation
    if "task_matches" in intent.entities:
        response["task_matches"] = intent.entities["task_matches"]
    elif "task_reference" in intent.entities:
        response["task_search_query"] = intent.entities["task_reference"]

    return response


def resolve_clarification(
    intent: IntentResult,
    user_response: Dict[str, Any]
) -> IntentResult:
    """
    Resolve clarification based on user's response.

    Args:
        intent: Original intent with ambiguities
        user_response: User's answers to clarification questions

    Returns:
        Resolved IntentResult with clarified entities
    """
    # Update entities based on user response
    resolved_entities = intent.entities.copy()

    # Handle date selection
    if "selected_date_index" in user_response:
        idx = user_response["selected_date_index"]
        if 0 <= idx < len(intent.date_interpretations):
            selected = intent.date_interpretations[idx]
            resolved_entities["due_date"] = selected.datetime or selected.date
            resolved_entities["due_date_confirmed"] = True

    # Handle direct date/time input
    if "due_date" in user_response:
        resolved_entities["due_date"] = user_response["due_date"]
        resolved_entities["due_date_confirmed"] = True

    # Handle task selection (from multiple matches)
    if "selected_task_id" in user_response:
        resolved_entities["task_id"] = user_response["selected_task_id"]
        resolved_entities.pop("task_reference", None)
        resolved_entities.pop("task_matches", None)
    elif "selected_task_index" in user_response:
        # User selected from numbered list
        idx = user_response["selected_task_index"]
        if "task_matches" in resolved_entities and 0 <= idx < len(resolved_entities["task_matches"]):
            selected_task = resolved_entities["task_matches"][idx]
            resolved_entities["task_id"] = selected_task["id"]
            resolved_entities["matched_task"] = selected_task
            resolved_entities.pop("task_reference", None)
            resolved_entities.pop("task_matches", None)

    # Handle title clarification
    if "title" in user_response:
        resolved_entities["title"] = user_response["title"]

    # Handle updates clarification
    if "updates" in user_response:
        resolved_entities["updates"] = user_response["updates"]

    # Handle priority update
    if "priority" in user_response:
        resolved_entities["priority"] = user_response["priority"]

    # Handle tag assignment
    if "tag_name" in user_response:
        resolved_entities["tag_name"] = user_response["tag_name"]
    if "tag_id" in user_response:
        resolved_entities["tag_id"] = user_response["tag_id"]

    # Rebuild updates from resolved entities for update_task intent
    if intent.intent_type == "update_task":
        resolved_entities["updates"] = build_updates_from_entities(resolved_entities)

    # Create resolved intent
    resolved_intent = IntentResult(
        intent_type=intent.intent_type,
        confidence=0.95,  # High confidence after clarification
        entities=resolved_entities,
        requires_clarification=False,
        clarification_questions=[],
        selected_interpretation=intent.date_interpretations[
            user_response.get("selected_date_index", 0)
        ] if intent.date_interpretations and "selected_date_index" in user_response else None,
    )

    agent_logger.info(
        f"Clarification resolved for intent: {intent.intent_type} "
        f"with entities: {resolved_entities}"
    )

    return resolved_intent


# =============================================================================
# Query Intent Parser (US4 - Intelligent Task Queries)
# =============================================================================


class QueryIntent(BaseModel):
    """Represents a parsed query intent for task filtering."""
    intent_type: str = Field(default="query_tasks", description="Always query_tasks for queries")
    query_type: str = Field(description="Type of query: time_based, priority, tag, status, general")
    filters: Dict[str, Any] = Field(default_factory=dict, description="Filters to apply")
    natural_language: str = Field(description="Original user query")
    confidence: float = Field(description="Confidence score 0.0 to 1.0")
    summary_template: str = Field(description="Template for summarizing results")


QUERY_PATTERNS = {
    # Time-based queries
    "overdue": {
        "patterns": [r"overdue", "what.*overdue", "tasks.*overdue", "show.*overdue"],
        "query_type": "time_based",
        "filters": {"is_overdue": True},
        "summary": "You have {count} overdue task{s}",
    },
    "this_week": {
        "patterns": [r"this\s*week", "due\s*this\s*week"],
        "query_type": "time_based",
        "filters": {"expression": "this_week"},
        "summary": "You have {count} task{s} due this week",
    },
    "next_week": {
        "patterns": [r"next\s*week", "due\s*next\s*week"],
        "query_type": "time_based",
        "filters": {"expression": "next_week"},
        "summary": "You have {count} task{s} due next week",
    },
    "today": {
        "patterns": [r"today", "due\s*today"],
        "query_type": "time_based",
        "filters": {"expression": "today"},
        "summary": "You have {count} task{s} due today",
    },
    "tomorrow": {
        "patterns": [r"tomorrow", "due\s*tomorrow"],
        "query_type": "time_based",
        "filters": {"expression": "tomorrow"},
        "summary": "You have {count} task{s} due tomorrow",
    },
    "this_month": {
        "patterns": [r"this\s*month", "due\s*this\s*month"],
        "query_type": "time_based",
        "filters": {"expression": "this_month"},
        "summary": "You have {count} task{s} due this month",
    },
    "next_month": {
        "patterns": [r"next\s*month", "due\s*next\s*month"],
        "query_type": "time_based",
        "filters": {"expression": "next_month"},
        "summary": "You have {count} task{s} due next month",
    },
    # Priority queries
    "high_priority": {
        "patterns": [r"high\s*priority", "urgent\s*(tasks)?", "priority.*high"],
        "query_type": "priority",
        "filters": {"priority": "high"},
        "summary": "You have {count} high priority task{s}",
    },
    "medium_priority": {
        "patterns": [r"medium\s*priority", "priority.*medium"],
        "query_type": "priority",
        "filters": {"priority": "medium"},
        "summary": "You have {count} medium priority task{s}",
    },
    "low_priority": {
        "patterns": [r"low\s*priority", "priority.*low"],
        "query_type": "priority",
        "filters": {"priority": "low"},
        "summary": "You have {count} low priority task{s}",
    },
    # Status queries
    "completed": {
        "patterns": [r"completed\s*(tasks)?", "done\s*(tasks)?", "finished"],
        "query_type": "status",
        "filters": {"status": "completed"},
        "summary": "You have {count} completed task{s}",
    },
    "active": {
        "patterns": [r"active\s*(tasks)?", "pending\s*(tasks)?", "incomplete"],
        "query_type": "status",
        "filters": {"status": "active"},
        "summary": "You have {count} active task{s}",
    },
    "in_progress": {
        "patterns": [r"in\s*progress", "working\s*on"],
        "query_type": "status",
        "filters": {"status": "in_progress"},
        "summary": "You have {count} task{s} in progress",
    },
    # Tag queries
    "tagged": {
        "patterns": [r"tagged?\s+(\w+)", r"with\s+(?:the\s+)?(\w+)\s+tag", r"tag:\s*(\w+)"],
        "query_type": "tag",
        "filters": {"tag_pattern": True},  # Tag name extracted from regex
        "summary": "You have {count} task{s} tagged with '{tag_name}'",
    },
    # General queries
    "all_tasks": {
        "patterns": [r"what\s*(are)?\s*(my)?\s*tasks", r"show\s*(me)?\s*(my)?\s*tasks", r"list\s*(all)?\s*(my)?\s*tasks", r"find\s*tasks"],
        "query_type": "general",
        "filters": {},
        "summary": "You have {count} task{s}",
    },
}


def parse_query_intent(user_message: str) -> QueryIntent:
    """
    Parse a natural language query to extract intent and filters.

    Args:
        user_message: User's query message

    Returns:
        QueryIntent with parsed query type and filters
    """
    from ..utils.date_parser import parse_query_date_filters

    message_lower = user_message.lower().strip()

    # Check each query pattern
    for query_name, pattern_config in QUERY_PATTERNS.items():
        for pattern in pattern_config["patterns"]:
            if isinstance(pattern, str):
                # Simple string match
                if pattern in message_lower:
                    filters = pattern_config["filters"].copy()

                    # For tag queries, extract the tag name
                    if pattern_config["query_type"] == "tag":
                        match = re.search(pattern, message_lower)
                        if match:
                            tag_name = match.group(1) if match.lastindex else None
                            if tag_name:
                                filters["tag_name"] = tag_name

                    return QueryIntent(
                        intent_type="query_tasks",
                        query_type=pattern_config["query_type"],
                        filters=filters,
                        natural_language=user_message,
                        confidence=0.9,
                        summary_template=pattern_config["summary"],
                    )
            else:
                # Regex pattern
                if re.search(pattern, message_lower):
                    filters = pattern_config["filters"].copy()

                    # For tag queries, extract the tag name
                    if pattern_config["query_type"] == "tag":
                        match = re.search(pattern, message_lower)
                        if match:
                            tag_name = match.group(1) if match.lastindex else None
                            if tag_name:
                                filters["tag_name"] = tag_name

                    return QueryIntent(
                        intent_type="query_tasks",
                        query_type=pattern_config["query_type"],
                        filters=filters,
                        natural_language=user_message,
                        confidence=0.85,
                        summary_template=pattern_config["summary"],
                    )

    # Check for date range filters using the date parser
    date_filters = parse_query_date_filters(user_message)
    if date_filters.get("success"):
        # Build filters from date parser result
        filters = {}

        if date_filters.get("is_overdue"):
            filters["is_overdue"] = True
            summary_template = "You have {count} overdue task{s}"
            query_type = "time_based"
        elif date_filters.get("date_from") or date_filters.get("date_to"):
            filters["date_from"] = date_filters.get("date_from")
            filters["date_to"] = date_filters.get("date_to")
            summary_template = "You have {count} task{s} in this date range"
            query_type = "time_based"
        else:
            summary_template = "You have {count} task{s}"
            query_type = "general"

        if date_filters.get("priority"):
            filters["priority"] = date_filters["priority"]
            query_type = "priority"

        if date_filters.get("status"):
            filters["status"] = date_filters["status"]
            query_type = "status"

        if date_filters.get("tag_filter"):
            filters["tag_name"] = date_filters["tag_filter"]
            query_type = "tag"
            summary_template = "You have {count} task{s} tagged with '{tag_name}'"

        return QueryIntent(
            intent_type="query_tasks",
            query_type=query_type,
            filters=filters,
            natural_language=user_message,
            confidence=0.8,
            summary_template=summary_template,
        )

    # Default to general query if no pattern matched
    return QueryIntent(
        intent_type="query_tasks",
        query_type="general",
        filters={},
        natural_language=user_message,
        confidence=0.5,
        summary_template="Here are your task{s}",
    )


def build_get_tasks_params(query_intent: QueryIntent) -> Dict[str, Any]:
    """
    Build parameters for get_tasks tool from query intent.

    Args:
        query_intent: Parsed query intent

    Returns:
        Dictionary of parameters for get_tasks tool
    """
    from ..utils.date_parser import get_date_range_for_expression

    params = {
        "status": "all",
        "priority": "all",
        "tag_ids": None,
        "search": None,
        "date_from": None,
        "date_to": None,
    }

    filters = query_intent.filters

    # Handle status filter
    if "status" in filters:
        params["status"] = filters["status"]

    # Handle priority filter
    if "priority" in filters:
        params["priority"] = filters["priority"]

    # Handle date range from expression
    if "expression" in filters:
        date_range = get_date_range_for_expression(filters["expression"])
        if date_range.get("success"):
            params["date_from"] = date_range.get("date_from")
            params["date_to"] = date_range.get("date_to")

    # Handle explicit date range
    if "date_from" in filters:
        params["date_from"] = filters["date_from"]
    if "date_to" in filters:
        params["date_to"] = filters["date_to"]

    # Handle overdue (no date_from, date_to is today)
    if filters.get("is_overdue"):
        params["date_to"] = datetime.now().strftime("%Y-%m-%dT00:00:00")
        params["status"] = "active"  # Only show active overdue tasks

    # Handle tag filter (will need to resolve tag name to ID)
    if "tag_name" in filters:
        # Store tag name for later resolution
        params["tag_name"] = filters["tag_name"]

    return params
