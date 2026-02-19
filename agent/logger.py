"""
Logging Infrastructure for AI Task Assistant

Provides centralized logging for agent operations, tool executions, and conversations.
"""

import logging
import sys
from pathlib import Path
from datetime import datetime

# Create logs directory
LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Log file with timestamp
LOG_FILE = LOG_DIR / f"agent_{datetime.now().strftime('%Y%m%d')}.log"


def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    Set up a logger with both console and file handlers.
    
    Args:
        name: Logger name (usually __name__)
        level: Logging level (default: INFO)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler
    try:
        file_handler = logging.FileHandler(LOG_FILE, encoding='utf-8')
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    except Exception as e:
        logger.warning(f"Could not create file handler: {e}")
    
    return logger


# Default logger for agent module
agent_logger = setup_logger("agent")


def log_tool_execution(tool_name: str, status: str, duration_ms: int, details: dict = None):
    """
    Log tool execution with structured data.
    
    Args:
        tool_name: Name of the tool executed
        status: Execution status (success, failed, retried)
        duration_ms: Execution time in milliseconds
        details: Additional context (optional)
    """
    log_data = {
        "event": "tool_execution",
        "tool_name": tool_name,
        "status": status,
        "duration_ms": duration_ms,
        **(details or {})
    }
    agent_logger.info(f"Tool: {tool_name} | Status: {status} | Duration: {duration_ms}ms")


def log_intent(intent_type: str, confidence: float, requires_clarification: bool = False):
    """
    Log intent parsing results.
    
    Args:
        intent_type: Type of intent detected
        confidence: Confidence score (0.0 to 1.0)
        requires_clarification: Whether MCP clarification is needed
    """
    status = "clarification_needed" if requires_clarification else "parsed"
    agent_logger.info(
        f"Intent: {intent_type} | Confidence: {confidence:.2f} | Status: {status}"
    )


def log_chat_message(role: str, content: str, conversation_id: str = None):
    """
    Log chat messages for debugging and auditing.
    
    Args:
        role: Message role (user, assistant, system)
        content: Message content
        conversation_id: Conversation identifier (optional)
    """
    preview = content[:100].replace('\n', ' ') + ('...' if len(content) > 100 else '')
    agent_logger.info(f"Chat [{role}]: {preview}")


def log_error(operation: str, error: Exception, context: dict = None):
    """
    Log errors with context for debugging.

    Args:
        operation: Operation that failed
        error: Exception instance
        context: Additional error context (optional)
    """
    error_data = {
        "event": "error",
        "operation": operation,
        "error_type": type(error).__name__,
        "error_message": str(error),
        **(context or {})
    }
    agent_logger.error(f"Error in {operation}: {error}", extra=error_data)


def log_recurrence_operation(operation: str, status: str, recurrence_id: str, details: dict = None):
    """
    Log recurrence-specific operations.

    Args:
        operation: Operation name (create, update, cancel, generate_next)
        status: Operation status (success, failed)
        recurrence_id: Recurrence pattern UUID
        details: Additional context (optional)
    """
    log_data = {
        "event": "recurrence_operation",
        "operation": operation,
        "status": status,
        "recurrence_id": recurrence_id,
        **(details or {})
    }
    agent_logger.info(
        f"Recurrence: {operation} | ID: {recurrence_id} | Status: {status}",
        extra=log_data
    )


def log_tag_operation(operation: str, status: str, tag_id: str, details: dict = None):
    """
    Log tag-specific operations.

    Args:
        operation: Operation name (create, update, delete, assign)
        status: Operation status (success, failed)
        tag_id: Tag UUID
        details: Additional context (optional)
    """
    log_data = {
        "event": "tag_operation",
        "operation": operation,
        "status": status,
        "tag_id": tag_id,
        **(details or {})
    }
    agent_logger.info(
        f"Tag: {operation} | ID: {tag_id} | Status: {status}",
        extra=log_data
    )


def log_reminder_operation(operation: str, status: str, reminder_id: str, details: dict = None):
    """
    Log reminder-specific operations.

    Args:
        operation: Operation name (schedule, cancel, trigger, dismiss)
        status: Operation status (success, failed, pending)
        reminder_id: Reminder UUID
        details: Additional context (optional)
    """
    log_data = {
        "event": "reminder_operation",
        "operation": operation,
        "status": status,
        "reminder_id": reminder_id,
        **(details or {})
    }
    agent_logger.info(
        f"Reminder: {operation} | ID: {reminder_id} | Status: {status}",
        extra=log_data
    )


def log_query_operation(
    query_type: str,
    status: str,
    result_count: int,
    filters: dict = None,
    duration_ms: int = None
):
    """
    Log task query operations for US4 (Intelligent Task Queries).

    Args:
        query_type: Type of query (time_based, priority, tag, status, general)
        status: Operation status (success, failed, no_results)
        result_count: Number of tasks returned
        filters: Applied filters (optional)
        duration_ms: Query execution time in milliseconds (optional)
    """
    log_data = {
        "event": "query_operation",
        "query_type": query_type,
        "status": status,
        "result_count": result_count,
        **(filters or {})
    }

    if duration_ms is not None:
        log_data["duration_ms"] = duration_ms

    duration_str = f" | Duration: {duration_ms}ms" if duration_ms else ""
    agent_logger.info(
        f"Query: {query_type} | Status: {status} | Results: {result_count}{duration_str}",
        extra=log_data
    )


def log_query_intent(intent_type: str, confidence: float, natural_language: str):
    """
    Log query intent parsing for US4.

    Args:
        intent_type: Parsed query type (time_based, priority, tag, status, general)
        confidence: Confidence score (0.0 to 1.0)
        natural_language: Original user query
    """
    log_data = {
        "event": "query_intent",
        "intent_type": intent_type,
        "confidence": confidence,
        "natural_language": natural_language,
    }
    preview = natural_language[:100].replace('\n', ' ') + ('...' if len(natural_language) > 100 else '')
    agent_logger.info(
        f"Query Intent: {intent_type} | Confidence: {confidence:.2f} | Query: {preview}",
        extra=log_data
    )


def log_conversation_operation(
    operation: str,
    status: str,
    conversation_id: str,
    details: dict = None
):
    """
    Log conversation-specific operations for US7 (Conversation History Management).

    Args:
        operation: Operation name (create, read, update, delete, search, restore, clear_all)
        status: Operation status (success, failed, not_found, unauthorized)
        conversation_id: Conversation UUID (use "N/A" for operations without specific conversation)
        details: Additional context (optional)
    """
    log_data = {
        "event": "conversation_operation",
        "operation": operation,
        "status": status,
        "conversation_id": conversation_id,
        **(details or {})
    }
    
    details_str = ""
    if details:
        details_parts = []
        for key, value in details.items():
            details_parts.append(f"{key}: {value}")
        if details_parts:
            details_str = f" | {', '.join(details_parts)}"
    
    agent_logger.info(
        f"Conversation: {operation} | ID: {conversation_id} | Status: {status}{details_str}",
        extra=log_data
    )


def log_conversation_search(query: str, result_count: int, user_id: str, duration_ms: int = None):
    """
    Log conversation search operations for US7.

    Args:
        query: Search query string
        result_count: Number of results found
        user_id: User identifier
        duration_ms: Search execution time in milliseconds (optional)
    """
    log_data = {
        "event": "conversation_search",
        "query": query,
        "result_count": result_count,
        "user_id": user_id,
    }
    
    if duration_ms is not None:
        log_data["duration_ms"] = duration_ms
    
    duration_str = f" | Duration: {duration_ms}ms" if duration_ms else ""
    preview = query[:100].replace('\n', ' ') + ('...' if len(query) > 100 else '')
    agent_logger.info(
        f"Conversation Search: '{preview}' | Results: {result_count}{duration_str}",
        extra=log_data
    )
