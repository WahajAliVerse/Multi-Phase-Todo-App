"""
Multi-Context Provider (MCP) Reasoning Module

Handles ambiguous intent clarification using MCP integration with OpenAI Agents SDK.
"""

from typing import List, Dict, Any, Optional
from agents import Agent, Runner
from pydantic import BaseModel, Field

from .config import logger
from .logger import agent_logger, log_intent
from .error_handler import ClarificationNeededError


class IntentResult(BaseModel):
    """Parsed intent with confidence and entities."""
    intent_type: str = Field(description="Type of intent (e.g., create_task, update_task)")
    confidence: float = Field(description="Confidence score 0.0 to 1.0")
    entities: Dict[str, Any] = Field(default_factory=dict, description="Extracted entities")
    requires_clarification: bool = Field(default=False, description="Whether clarification is needed")
    clarification_questions: List[str] = Field(default_factory=list, description="Questions to ask user")


class ClarificationResult(BaseModel):
    """Clarification response from MCP."""
    is_clear: bool = Field(description="Whether intent is now clear")
    answers: Dict[str, str] = Field(default_factory=dict, description="User's answers")
    refined_intent: Optional[str] = Field(default=None, description="Refined intent type")


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
- due_date: When task is due
- priority: low, medium, high
- status: pending, in_progress, completed
- tag_name: Tag name
- color: Tag color (hex)
- recurrence: Recurrence pattern

If intent is ambiguous or multiple interpretations exist, flag for clarification.
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


def detect_ambiguity(intent: IntentResult) -> bool:
    """
    Detect if intent requires clarification.
    
    Args:
        intent: Parsed intent
    
    Returns:
        True if clarification needed
    """
    # Low confidence
    if intent.confidence < 0.7:
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
    
    if intent.intent_type == "create_task":
        if "title" not in intent.entities:
            questions.append("What would you like to call this task?")
        if "due_date" in intent.entities and "tomorrow" in str(intent.entities.get("due_date", "")).lower():
            questions.append("You mentioned 'tomorrow' - could you specify the exact date and time?")
    
    elif intent.intent_type == "update_task":
        if "task_id" not in intent.entities:
            questions.append("Which task would you like to update?")
        if "updates" not in intent.entities:
            questions.append("What would you like to change about the task?")
    
    elif intent.intent_type == "create_recurring":
        if "pattern" not in intent.entities:
            questions.append("How often should this task repeat? (daily, weekly, monthly)")
    
    return questions or ["Could you provide more details about what you'd like to do?"]
