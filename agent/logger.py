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
