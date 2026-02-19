"""Tools module for AI Task Assistant backend API wrappers."""

from .task_tools import (
    create_task,
    get_tasks,
    update_task,
    delete_task,
    mark_task_complete,
)
from .tag_tools import (
    create_tag,
    get_tags,
    update_tag,
    delete_tag,
    assign_tag_to_task,
)
from .recurrence_tools import (
    create_recurring_task,
    update_recurrence_pattern,
    cancel_recurrence,
    generate_next_occurrence,
    schedule_task_reminder,
)
from .conversation_tools import (
    get_conversations,
    get_conversation,
    delete_conversation,
    restore_conversation,
    clear_all_conversations,
    create_conversation,
    add_message_to_conversation,
)

__all__ = [
    # Task tools
    "create_task",
    "get_tasks",
    "update_task",
    "delete_task",
    "mark_task_complete",
    # Tag tools
    "create_tag",
    "get_tags",
    "update_tag",
    "delete_tag",
    "assign_tag_to_task",
    # Recurrence tools
    "create_recurring_task",
    "update_recurrence_pattern",
    "cancel_recurrence",
    "generate_next_occurrence",
    "schedule_task_reminder",
    # Conversation tools
    "get_conversations",
    "get_conversation",
    "delete_conversation",
    "restore_conversation",
    "clear_all_conversations",
    "create_conversation",
    "add_message_to_conversation",
]
