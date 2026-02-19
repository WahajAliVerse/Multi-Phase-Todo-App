"""
AI Agent Implementation using OpenAI Agents SDK with Google Gemini

Provides the main agent loop for natural language task management.
"""

from agents import Agent, Runner, OpenAIChatCompletionsModel, ModelSettings
from openai import AsyncOpenAI
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncio

from .config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    OPENAI_BASE_URL,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW,
    logger
)
from .error_handler import handle_llm_errors, retry_with_backoff, LLMError
from .logger import agent_logger, log_chat_message, log_tool_execution


# Configure Gemini API client
gemini_client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url=OPENAI_BASE_URL,
) if GEMINI_API_KEY else None


# Configure model
gemini_model = OpenAIChatCompletionsModel(
    model=GEMINI_MODEL,
    openai_client=gemini_client,
) if gemini_client else None


def format_update_confirmation(
    task_id: str,
    task_title: str,
    updates: Dict[str, Any],
    updated_task: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Format a confirmation response for task update operations.

    Args:
        task_id: Task UUID
        task_title: Task title
        updates: Dictionary of fields that were updated
        updated_task: Full updated task data (optional)

    Returns:
        Dictionary with formatted confirmation message and action
    """
    # Build human-readable update description
    update_parts = []
    
    if "due_date" in updates:
        due_date = updates["due_date"]
        if due_date:
            try:
                parsed_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
                formatted_date = parsed_date.strftime("%B %d, %Y")
                update_parts.append(f"due date to {formatted_date}")
            except (ValueError, AttributeError):
                update_parts.append(f"due date to {due_date}")
        else:
            update_parts.append("due date removed")
    
    if "priority" in updates:
        priority = updates["priority"]
        emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(priority, "")
        update_parts.append(f"priority to {priority} {emoji}")
    
    if "title" in updates:
        update_parts.append(f"title to \"{updates['title']}\"")
    
    if "status" in updates:
        status = updates["status"]
        if status == "completed":
            update_parts.append("status to completed ✅")
        elif status == "in_progress":
            update_parts.append("status to in progress 🔄")
        else:
            update_parts.append(f"status to {status}")
    
    if "description" in updates:
        update_parts.append("description updated")
    
    # Build confirmation message
    update_str = ", ".join(update_parts) if update_parts else "details updated"
    message = f"✓ Updated \"{task_title}\" - set {update_str}"
    
    # Build action for frontend
    action = {
        "type": "update_task",
        "task_id": task_id,
        "details": {
            "title": task_title,
            **updates
        },
        "confirmed": True,
    }
    
    if updated_task:
        action["result"] = updated_task
    
    return {
        "message": message,
        "action": action,
    }


def format_tag_assignment_confirmation(
    task_id: str,
    task_title: str,
    tag_name: str,
    tag_color: Optional[str] = None
) -> Dict[str, Any]:
    """
    Format a confirmation response for tag assignment.

    Args:
        task_id: Task UUID
        task_title: Task title
        tag_name: Tag name
        tag_color: Tag color (optional)

    Returns:
        Dictionary with formatted confirmation message and action
    """
    color_indicator = ""
    if tag_color:
        color_indicator = f" <span style=\"color: {tag_color}\">●</span>"

    message = f"✓ Added \"{tag_name}\"{color_indicator} tag to \"{task_title}\""

    action = {
        "type": "assign_tag",
        "task_id": task_id,
        "details": {
            "title": task_title,
            "tag_name": tag_name,
            "tag_color": tag_color,
        },
        "confirmed": True,
    }

    return {
        "message": message,
        "action": action,
    }


def format_tag_creation_confirmation(
    tag_id: str,
    tag_name: str,
    tag_color: str,
    color_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Format a confirmation response for tag creation.

    Args:
        tag_id: Tag UUID
        tag_name: Tag name
        tag_color: Tag color (hex)
        color_name: Human-readable color name (optional)

    Returns:
        Dictionary with formatted confirmation message and action
    """
    color_display = color_name if color_name else tag_color
    message = f"✓ Created tag \"{tag_name}\" in {color_display} <span style=\"color: {tag_color}\">●</span>"

    action = {
        "type": "create_tag",
        "tag_id": tag_id,
        "details": {
            "name": tag_name,
            "color": tag_color,
            "color_name": color_name,
        },
        "confirmed": True,
    }

    return {
        "message": message,
        "action": action,
    }


def format_tag_update_confirmation(
    tag_id: str,
    tag_name: str,
    updates: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Format a confirmation response for tag update.

    Args:
        tag_id: Tag UUID
        tag_name: Current tag name
        updates: Dictionary of updated fields

    Returns:
        Dictionary with formatted confirmation message and action
    """
    update_parts = []
    
    if "name" in updates:
        update_parts.append(f"name to \"{updates['name']}\"")
    if "color" in updates:
        color = updates["color"]
        update_parts.append(f"color to <span style=\"color: {color}\">●</span> {color}")

    update_str = " and ".join(update_parts) if update_parts else "details"
    message = f"✓ Updated tag \"{tag_name}\" - set {update_str}"

    action = {
        "type": "update_tag",
        "tag_id": tag_id,
        "details": {
            "name": tag_name,
            "updates": updates,
        },
        "confirmed": True,
    }

    return {
        "message": message,
        "action": action,
    }


def format_tag_deletion_confirmation(
    tag_id: str,
    tag_name: str
) -> Dict[str, Any]:
    """
    Format a confirmation response for tag deletion.

    Args:
        tag_id: Tag UUID
        tag_name: Tag name

    Returns:
        Dictionary with formatted confirmation message and action
    """
    message = f"✓ Deleted tag \"{tag_name}\""

    action = {
        "type": "delete_tag",
        "tag_id": tag_id,
        "details": {
            "name": tag_name,
        },
        "confirmed": True,
    }

    return {
        "message": message,
        "action": action,
    }


def format_tags_list_response(tags: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Format a response for listing tags.

    Args:
        tags: List of tag objects

    Returns:
        Dictionary with formatted message and tag list
    """
    if not tags:
        return {
            "message": "You don't have any tags yet. Create one by saying \"Create a work tag in red\"",
            "action": None,
        }

    tag_list = "\n".join([
        f"  • {tag.get('name', 'Unknown')} <span style=\"color: {tag.get('color', '#888')}\">●</span>"
        for tag in tags
    ])

    message = f"Here are your tags ({len(tags)}):\n{tag_list}"

    return {
        "message": message,
        "action": {
            "type": "query_tags",
            "details": {
                "tags": tags,
                "count": len(tags),
            },
            "confirmed": True,
        },
    }


def format_priority_update_confirmation(
    task_id: str,
    task_title: str,
    new_priority: str
) -> Dict[str, Any]:
    """
    Format a confirmation response for priority update.

    Args:
        task_id: Task UUID
        task_title: Task title
        new_priority: New priority level

    Returns:
        Dictionary with formatted confirmation message and action
    """
    emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(new_priority, "")
    message = f"✓ Changed priority of \"{task_title}\" to {new_priority} {emoji}"
    
    action = {
        "type": "update_task",
        "task_id": task_id,
        "details": {
            "title": task_title,
            "priority": new_priority,
        },
        "confirmed": True,
    }
    
    return {
        "message": message,
        "action": action,
    }


def format_due_date_update_confirmation(
    task_id: str,
    task_title: str,
    new_due_date: str
) -> Dict[str, Any]:
    """
    Format a confirmation response for due date update.

    Args:
        task_id: Task UUID
        task_title: Task title
        new_due_date: New due date in ISO format

    Returns:
        Dictionary with formatted confirmation message and action
    """
    try:
        parsed_date = datetime.fromisoformat(new_due_date.replace("Z", "+00:00"))
        formatted_date = parsed_date.strftime("%A, %B %d, %Y")
    except (ValueError, AttributeError):
        formatted_date = new_due_date
    
    message = f"✓ Moved \"{task_title}\" to {formatted_date}"
    
    action = {
        "type": "update_task",
        "task_id": task_id,
        "details": {
            "title": task_title,
            "due_date": new_due_date,
        },
        "confirmed": True,
    }
    
    return {
        "message": message,
        "action": action,
    }


def format_completion_confirmation(
    task_id: str,
    task_title: str
) -> Dict[str, Any]:
    """
    Format a confirmation response for task completion.

    Args:
        task_id: Task UUID
        task_title: Task title

    Returns:
        Dictionary with formatted confirmation message and action
    """
    message = f"✓ Marked \"{task_title}\" as complete ✅"

    action = {
        "type": "complete_task",
        "task_id": task_id,
        "details": {
            "title": task_title,
        },
        "confirmed": True,
    }

    return {
        "message": message,
        "action": action,
    }


def format_reminder_confirmation(
    reminder_id: str,
    task_id: str,
    task_title: str,
    reminder_time: str,
    delivery_method: str = "browser",
    message: Optional[str] = None,
    is_recurring: bool = False,
    recurrence_description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Format a confirmation response for reminder scheduling.

    Args:
        reminder_id: Reminder UUID
        task_id: Task UUID
        task_title: Task title
        reminder_time: When reminder will trigger (ISO format)
        delivery_method: How reminder will be delivered (browser, email, push)
        message: Reminder message
        is_recurring: Whether this is a recurring reminder
        recurrence_description: Human-readable recurrence description

    Returns:
        Dictionary with formatted confirmation message and action
    """
    # Format reminder time for display
    try:
        parsed_time = datetime.fromisoformat(reminder_time.replace("Z", "+00:00"))
        now = datetime.now(parsed_time.tzinfo) if parsed_time.tzinfo else datetime.now()
        diff = parsed_time - now

        if diff.days == 0:
            if diff.seconds < 3600:
                mins = diff.seconds // 60
                time_display = f"in {mins} minutes"
            else:
                hours = diff.seconds // 3600
                time_display = f"in {hours} hour{'s' if hours > 1 else ''}"
        elif diff.days == 1:
            time_display = "tomorrow"
        elif diff.days < 7:
            time_display = parsed_time.strftime("%A at %I:%M %p")
        else:
            time_display = parsed_time.strftime("%B %d at %I:%M %p")
    except (ValueError, AttributeError):
        time_display = reminder_time

    # Format delivery method display
    delivery_icons = {
        "browser": "🔔",
        "email": "📧",
        "push": "📱",
    }
    delivery_names = {
        "browser": "browser notification",
        "email": "email",
        "push": "push notification",
    }
    delivery_icon = delivery_icons.get(delivery_method, "🔔")
    delivery_name = delivery_names.get(delivery_method, delivery_method)

    # Build confirmation message
    if is_recurring and recurrence_description:
        message_text = f"✓ Set recurring reminder: {recurrence_description} {delivery_icon}"
    else:
        message_text = f"✓ Reminder set for \"{task_title}\" - {time_display} via {delivery_name} {delivery_icon}"

    if message:
        message_text += f"\n\nMessage: {message}"

    # Build action for frontend
    action = {
        "type": "schedule_reminder",
        "task_id": task_id,
        "details": {
            "title": task_title,
            "reminder_time": reminder_time,
            "reminder_time_display": time_display,
            "delivery_method": delivery_method,
            "delivery_name": delivery_name,
            "message": message,
            "is_recurring": is_recurring,
            "recurrence_description": recurrence_description,
        },
        "confirmed": True,
    }

    if reminder_id:
        action["reminder_id"] = reminder_id

    return {
        "message": message_text,
        "action": action,
    }


def format_reminder_clarification(
    task_reference: str,
    missing_info: List[str]
) -> Dict[str, Any]:
    """
    Format a clarification request for reminder scheduling.

    Args:
        task_reference: Task reference from user
        missing_info: List of missing information (e.g., "reminder_time", "delivery_method")

    Returns:
        Dictionary with clarification message
    """
    clarification_map = {
        "reminder_time": "When would you like to be reminded? (e.g., '30 minutes before', 'tomorrow at 9am', 'every day at 8pm')",
        "delivery_method": "How would you like to be reminded? (browser notification, email, or push notification)",
        "task_reference": "Which task should I set the reminder for?",
    }

    questions = [clarification_map.get(info, f"Please specify: {info}") for info in missing_info]

    message = f"I need a bit more information to set your reminder for \"{task_reference}\":\n\n"
    message += "\n".join([f"• {q}" for q in questions])

    return {
        "message": message,
        "action": {
            "type": "clarification_needed",
            "details": {
                "task_reference": task_reference,
                "missing_info": missing_info,
                "questions": questions,
            },
            "confirmed": False,
        },
    }


def format_reminder_list_response(reminders: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Format a response for listing reminders.

    Args:
        reminders: List of reminder objects

    Returns:
        Dictionary with formatted message and reminder list
    """
    if not reminders:
        return {
            "message": "You don't have any reminders set. Say \"Remind me 30 minutes before my meeting\" to create one.",
            "action": None,
        }

    reminder_list = "\n".join([
        f"  • {reminder.get('task_title', 'Task')} - {reminder.get('reminder_time_display', 'Unknown')} via {reminder.get('delivery_method', 'browser')} 🔔"
        for reminder in reminders
    ])

    message = f"Here are your reminders ({len(reminders)}):\n{reminder_list}"

    return {
        "message": message,
        "action": {
            "type": "query_reminders",
            "details": {
                "reminders": reminders,
                "count": len(reminders),
            },
            "confirmed": True,
        },
    }


def create_agent(
    name: str = "TodoAssistant",
    instructions: str = None,
    tools: list = None,
    model_settings: ModelSettings = None
) -> Agent:
    """
    Create and configure the AI agent.

    Args:
        name: Agent name
        instructions: System instructions for agent behavior
        tools: List of function tools for the agent
        model_settings: Model configuration (temperature, max_tokens, etc.)

    Returns:
        Configured Agent instance
    """
    default_instructions = """You are a senior AI assistant for a production Todo app.
Your role is to help users manage their tasks through natural language conversations.

Guidelines:
- Be helpful, concise, and friendly
- Use available tools to execute user requests
- Ask for clarification when intent is ambiguous
- Confirm important actions before executing
- Provide clear, actionable responses
- Respect user limits and rate constraints

Task Update Patterns:
- "Move [task] to [date]" → Update due date
- "Change priority of [task] to [priority]" → Update priority
- "Add [tag] tag to [task]" → Assign tag
- "Mark [task] as done" → Complete task
- "Reschedule [task]" → Update due date
"""

    default_model_settings = ModelSettings(
        temperature=0.4,  # Balanced creativity/accuracy
        max_tokens=700,   # Sufficient for most responses
        tool_choice="auto"  # Let model decide when to use tools
    )

    agent = Agent(
        name=name,
        instructions=instructions or default_instructions,
        tools=tools or [],
        model_settings=model_settings or default_model_settings,
    )

    agent_logger.info(f"Agent created: {name} with model {GEMINI_MODEL}")
    return agent


class AgentRunner:
    """
    Manages agent execution with conversation history and error handling.
    """
    
    def __init__(self, agent: Agent):
        self.agent = agent
        self.conversation_history: List[Dict[str, Any]] = []
    
    @handle_llm_errors
    @retry_with_backoff(max_retries=3)
    async def run_async(
        self,
        user_message: str,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run agent asynchronously with user message.
        
        Args:
            user_message: User's natural language input
            conversation_id: Optional conversation identifier
        
        Returns:
            Dictionary with response, action, and metadata
        """
        log_chat_message("user", user_message, conversation_id)
        
        # Build conversation context
        messages = self._build_messages(user_message)
        
        # Run agent
        result = await Runner.run(
            self.agent,
            messages,
        )
        
        # Extract response
        response = {
            "success": True,
            "message": {
                "role": "assistant",
                "content": result.final_output,
            },
            "action": self._extract_action(result),
            "metadata": {
                "conversation_id": conversation_id,
                "model": GEMINI_MODEL,
            }
        }
        
        log_chat_message("assistant", result.final_output, conversation_id)
        return response
    
    @handle_llm_errors
    @retry_with_backoff(max_retries=3)
    def run_sync(
        self,
        user_message: str,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run agent synchronously with user message.
        
        Args:
            user_message: User's natural language input
            conversation_id: Optional conversation identifier
        
        Returns:
            Dictionary with response, action, and metadata
        """
        log_chat_message("user", user_message, conversation_id)
        
        # Build conversation context
        messages = self._build_messages(user_message)
        
        # Run agent
        result = Runner.run_sync(
            self.agent,
            messages,
        )
        
        # Extract response
        response = {
            "success": True,
            "message": {
                "role": "assistant",
                "content": result.final_output,
            },
            "action": self._extract_action(result),
            "metadata": {
                "conversation_id": conversation_id,
                "model": GEMINI_MODEL,
            }
        }
        
        log_chat_message("assistant", result.final_output, conversation_id)
        return response
    
    def _build_messages(self, user_message: str) -> List[Dict[str, str]]:
        """
        Build message list with conversation history.
        
        Args:
            user_message: Current user message
        
        Returns:
            List of message dictionaries
        """
        messages = []
        
        # Add system instruction (from agent)
        # Note: Agent handles this internally
        
        # Add conversation history (last 10 messages for context)
        messages.extend(self.conversation_history[-10:])
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        return messages
    
    def _extract_action(self, result) -> Optional[Dict[str, Any]]:
        """
        Extract tool execution results from agent output.
        
        Args:
            result: Agent run result
        
        Returns:
            Action dictionary or None
        """
        # Check for tool calls in result
        if hasattr(result, 'tool_calls') and result.tool_calls:
            tool_call = result.tool_calls[0]
            return {
                "type": "tool_call",
                "tool_name": getattr(tool_call, 'name', 'unknown'),
                "arguments": getattr(tool_call, 'arguments', {}),
            }
        
        return None
    
    def add_to_history(self, role: str, content: str):
        """
        Add message to conversation history.
        
        Args:
            role: Message role (user/assistant)
            content: Message content
        """
        self.conversation_history.append({
            "role": role,
            "content": content,
        })
    
    def clear_history(self):
        """Clear conversation history."""
        self.conversation_history = []
        agent_logger.info("Conversation history cleared")


# Default agent instance
default_agent = create_agent() if gemini_model else None
default_runner = AgentRunner(default_agent) if default_agent else None


def get_default_runner() -> Optional[AgentRunner]:
    """Get the default agent runner."""
    return default_runner


# =============================================================================
# Task Query Response Formatting (US4 - Intelligent Task Queries)
# =============================================================================


def format_task_summary(task: Dict[str, Any]) -> str:
    """
    Format a single task for display in query results.

    Args:
        task: Task dictionary

    Returns:
        Formatted task summary string
    """
    title = task.get("title", "Untitled")
    due_date = task.get("due_date")
    priority = task.get("priority", "medium")
    status = task.get("status", "pending")
    tags = task.get("tags", [])

    # Priority emoji
    priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(priority, "⚪")

    # Status emoji
    status_emoji = {"completed": "✅", "in_progress": "🔄", "pending": "⏳"}.get(status, "")

    # Format due date
    due_date_str = ""
    if due_date:
        try:
            parsed = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            due_date_str = parsed.strftime("%b %d, %Y")
        except (ValueError, AttributeError):
            due_date_str = str(due_date)

    # Build task line
    parts = [f"• {title}"]
    if due_date_str:
        parts.append(f"📅 {due_date_str}")
    parts.append(f"{priority_emoji}")
    if status_emoji:
        parts.append(f"{status_emoji}")

    return " ".join(parts)


def format_tasks_list_response(
    tasks: List[Dict[str, Any]],
    query_intent: Optional[Any] = None,
    query_type: str = "general"
) -> Dict[str, Any]:
    """
    Format a response for listing tasks from a query.

    Args:
        tasks: List of task objects
        query_intent: Optional QueryIntent with summary template
        query_type: Type of query (time_based, priority, tag, status, general)

    Returns:
        Dictionary with formatted message and task list
    """
    count = len(tasks)

    # Handle empty results
    if count == 0:
        empty_messages = {
            "time_based": "No tasks found for this time period.",
            "priority": "No tasks with this priority level.",
            "tag": "No tasks found with this tag.",
            "status": "No tasks with this status.",
            "general": "You don't have any tasks yet. Create one by saying \"Create a task to buy groceries\"",
        }
        return {
            "message": empty_messages.get(query_type, "No tasks found."),
            "action": {
                "type": "query_tasks",
                "details": {
                    "tasks": [],
                    "count": 0,
                    "query_type": query_type,
                },
                "confirmed": True,
            },
        }

    # Build summary message
    if query_intent and hasattr(query_intent, "summary_template"):
        summary = query_intent.summary_template
    else:
        summary = "You have {count} task{s}"

    # Handle pluralization
    summary = summary.replace("{count}", str(count))
    summary = summary.replace("{s}", "" if count == 1 else "s")

    # Handle tag name substitution
    if query_intent and hasattr(query_intent, "filters"):
        tag_name = query_intent.filters.get("tag_name")
        if tag_name:
            summary = summary.replace("{tag_name}", tag_name)

    # Add context based on query type
    context_messages = {
        "time_based": {
            "overdue": " that are overdue",
            "today": " due today",
            "tomorrow": " due tomorrow",
            "this_week": "",  # Already in template
            "next_week": "",  # Already in template
        },
        "priority": {
            "high": " - these need your attention",
            "medium": "",
            "low": "",
        },
        "status": {
            "completed": " - well done!",
            "active": "",
            "in_progress": "",
        },
    }

    if query_type in context_messages:
        subtype = None
        if query_intent and hasattr(query_intent, "filters"):
            if "is_overdue" in query_intent.filters:
                subtype = "overdue"
            elif "expression" in query_intent.filters:
                subtype = query_intent.filters["expression"]
            elif "priority" in query_intent.filters:
                subtype = query_intent.filters["priority"]
            elif "status" in query_intent.filters:
                subtype = query_intent.filters["status"]

        if subtype and subtype in context_messages.get(query_type, {}):
            summary += context_messages[query_type].get(subtype, "")

    # Build task list
    task_list = "\n".join([format_task_summary(task) for task in tasks[:10]])

    if count > 10:
        task_list += f"\n\n... and {count - 10} more task{s}"

    message = f"{summary}\n\n{task_list}"

    return {
        "message": message,
        "action": {
            "type": "query_tasks",
            "details": {
                "tasks": tasks,
                "count": count,
                "query_type": query_type,
                "summary": summary,
            },
            "confirmed": True,
        },
    }


def summarize_query_results(
    tasks: List[Dict[str, Any]],
    query_type: str,
    filters: Optional[Dict[str, Any]] = None
) -> str:
    """
    Generate a natural language summary of query results.

    Args:
        tasks: List of tasks returned
        query_type: Type of query performed
        filters: Applied filters

    Returns:
        Natural language summary string
    """
    count = len(tasks)
    filters = filters or {}

    if count == 0:
        return "No tasks found matching your criteria."

    # Build summary based on query type
    if query_type == "time_based":
        if filters.get("is_overdue"):
            return f"You have {count} overdue task{'' if count == 1 else 's'} that need attention."
        expression = filters.get("expression", "")
        if expression == "today":
            return f"You have {count} task{'' if count == 1 else 's'} due today."
        elif expression == "tomorrow":
            return f"You have {count} task{'' if count == 1 else 's'} due tomorrow."
        elif expression == "this_week":
            return f"You have {count} task{'' if count == 1 else 's'} due this week."
        elif expression == "next_week":
            return f"You have {count} task{'' if count == 1 else 's'} due next week."

    elif query_type == "priority":
        priority = filters.get("priority", "")
        priority_adj = {"high": "high-priority", "medium": "medium-priority", "low": "low-priority"}.get(priority, priority)
        return f"You have {count} {priority_adj} task{'' if count == 1 else 's'}."

    elif query_type == "status":
        status = filters.get("status", "")
        if status == "completed":
            return f"You've completed {count} task{'' if count == 1 else 's'}."
        elif status == "in_progress":
            return f"You have {count} task{'' if count == 1 else 's'} in progress."
        else:
            return f"You have {count} active task{'' if count == 1 else 's'}."

    elif query_type == "tag":
        tag_name = filters.get("tag_name", "this tag")
        return f"You have {count} task{'' if count == 1 else 's'} tagged with '{tag_name}'."

    # Default summary
    return f"Found {count} task{'' if count == 1 else 's'}."
