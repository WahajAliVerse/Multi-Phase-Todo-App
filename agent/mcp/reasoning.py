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
- update_task: Modify an existing task
- delete_task: Remove a task
- query_tasks: Search/filter tasks
- create_tag: Create a new tag
- assign_tag: Assign tag to task
- create_recurring: Create recurring task
- schedule_reminder: Schedule task reminder

Extract entities like:
- title: Task title/description
- due_date: When task is due (ISO 8601 format if specific)
- priority: low, medium, high
- status: pending, in_progress, completed
- tag_name: Tag name
- color: Tag color (hex)
- recurrence: Recurrence pattern
- task_id: Task identifier for updates/deletes
- task_reference: Reference to task (e.g., "dentist appointment")

CRITICAL RULES:
1. If date expression is ambiguous (e.g., "next week", "tomorrow at 5pm" without specific date), set confidence < 0.7
2. Flag requires_clarification=true when confidence < 0.7 or critical entities are missing
3. For ambiguous dates, include the raw expression in due_date entity for further processing
4. When user references a task by name (not ID), include task_reference entity
5. Always extract as many entities as possible, even if clarification is needed

Output must be valid JSON matching IntentResult schema.
""",
    output_type=IntentResult,
)


async def parse_intent(user_message: str) -> IntentResult:
    """
    Parse user message to extract intent and entities.

    Args:
        user_message: User's natural language input

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

    # Handle date ambiguities first
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
        if "task_id" not in intent.entities:
            if "task_reference" in intent.entities:
                questions.append(f"Which task are you referring to when you say '{intent.entities['task_reference']}'?")
            else:
                questions.append("Which task would you like to update?")
        if "updates" not in intent.entities:
            questions.append("What would you like to change about the task?")

    elif intent.intent_type == "delete_task":
        if "task_id" not in intent.entities:
            if "task_reference" in intent.entities:
                questions.append(f"Which task are you referring to when you say '{intent.entities['task_reference']}'?")
            else:
                questions.append("Which task would you like to delete?")

    elif intent.intent_type == "create_recurring":
        if "pattern" not in intent.entities:
            questions.append("How often should this task repeat? (daily, weekly, monthly)")
        if "task_id" not in intent.entities:
            questions.append("Which task should be set to repeat?")

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

    # Include task matches if task_reference was provided
    if "task_reference" in intent.entities:
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

    # Handle task selection
    if "selected_task_id" in user_response:
        resolved_entities["task_id"] = user_response["selected_task_id"]
        resolved_entities.pop("task_reference", None)

    # Handle title clarification
    if "title" in user_response:
        resolved_entities["title"] = user_response["title"]

    # Handle updates clarification
    if "updates" in user_response:
        resolved_entities["updates"] = user_response["updates"]

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
