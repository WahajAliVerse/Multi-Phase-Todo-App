"""
Error Handler for AI Task Assistant

Provides comprehensive error handling with retry logic, exponential backoff,
and user-friendly error messages.
"""

import asyncio
import time
from functools import wraps
from typing import Callable, Any, Optional, Dict, Type
from openai import APIError, APITimeoutError, APIConnectionError, RateLimitError

from .logger import agent_logger, log_error


class AgentError(Exception):
    """Base exception for AI Agent errors."""
    
    def __init__(self, message: str, code: str = "AGENT_ERROR", details: Dict = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)


class LLMError(AgentError):
    """Error from LLM (Gemini) API."""
    
    def __init__(self, message: str, details: Dict = None):
        super().__init__(message, code="LLM_ERROR", details=details)


class BackendError(AgentError):
    """Error from backend API."""
    
    def __init__(self, message: str, status_code: int = None, details: Dict = None):
        super().__init__(message, code="BACKEND_ERROR", details=details)
        self.status_code = status_code


class ToolExecutionError(AgentError):
    """Error during tool execution."""
    
    def __init__(self, tool_name: str, message: str, details: Dict = None):
        super().__init__(
            f"Tool '{tool_name}' failed: {message}",
            code="TOOL_EXECUTION_ERROR",
            details={"tool_name": tool_name, **(details or {})}
        )


class ClarificationNeededError(AgentError):
    """Intent is ambiguous and requires user clarification."""
    
    def __init__(self, questions: list, context: Dict = None):
        super().__init__(
            "Clarification needed",
            code="CLARIFICATION_NEEDED",
            details={"questions": questions, **(context or {})}
        )
        self.questions = questions


def get_user_friendly_message(error: Exception) -> str:
    """
    Convert technical error messages to user-friendly messages.
    
    Args:
        error: Exception instance
    
    Returns:
        User-friendly error message
    """
    if isinstance(error, ClarificationNeededError):
        return "I need a bit more information to help you accurately. Could you please clarify?"
    
    if isinstance(error, LLMError):
        return "I'm having trouble processing your request right now. Please try again in a moment."
    
    if isinstance(error, BackendError):
        if error.status_code == 404:
            return "I couldn't find that item. It may have been deleted or doesn't exist."
        elif error.status_code == 403:
            return "You don't have permission to perform this action."
        elif error.status_code >= 500:
            return "The server is experiencing issues. Please try again later."
        else:
            return "Something went wrong. Please try again."
    
    if isinstance(error, ToolExecutionError):
        return f"I encountered an issue while performing that action. Please try again."
    
    if isinstance(error, RateLimitError):
        return "Too many requests. Please wait a moment before trying again."
    
    if isinstance(error, APITimeoutError):
        return "The request timed out. Please try again."
    
    if isinstance(error, APIConnectionError):
        return "Having trouble connecting to the service. Please check your connection and try again."
    
    # Default message
    return "An unexpected error occurred. Please try again."


def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 10.0,
    exponential_base: float = 2.0,
    retryable_exceptions: tuple = (APITimeoutError, APIConnectionError, RateLimitError)
):
    """
    Decorator for retrying functions with exponential backoff.
    
    Args:
        max_retries: Maximum number of retry attempts
        base_delay: Initial delay in seconds
        max_delay: Maximum delay in seconds
        exponential_base: Base for exponential backoff
        retryable_exceptions: Tuple of exceptions that trigger retries
    
    Returns:
        Decorated function with retry logic
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except retryable_exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries:
                        break
                    
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)
                    agent_logger.warning(
                        f"Attempt {attempt + 1}/{max_retries + 1} failed. "
                        f"Retrying in {delay:.1f}s... Error: {e}"
                    )
                    await asyncio.sleep(delay)
                except Exception as e:
                    # Non-retryable exception
                    log_error(func.__name__, e)
                    raise
            
            # All retries exhausted
            raise LLMError(
                f"Failed after {max_retries + 1} attempts: {last_exception}",
                details={"last_error": str(last_exception)}
            )
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except retryable_exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries:
                        break
                    
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)
                    agent_logger.warning(
                        f"Attempt {attempt + 1}/{max_retries + 1} failed. "
                        f"Retrying in {delay:.1f}s... Error: {e}"
                    )
                    time.sleep(delay)
                except Exception as e:
                    # Non-retryable exception
                    log_error(func.__name__, e)
                    raise
            
            # All retries exhausted
            raise LLMError(
                f"Failed after {max_retries + 1} attempts: {last_exception}",
                details={"last_error": str(last_exception)}
            )
        
        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


def handle_llm_errors(func: Callable) -> Callable:
    """
    Decorator to handle LLM API errors gracefully.
    
    Converts OpenAI API errors to AgentError with user-friendly messages.
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except APIError as e:
            log_error(func.__name__, e)
            raise LLMError(str(e), details={"status_code": getattr(e, 'status_code', None)})
        except Exception as e:
            log_error(func.__name__, e)
            raise
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except APIError as e:
            log_error(func.__name__, e)
            raise LLMError(str(e), details={"status_code": getattr(e, 'status_code', None)})
        except Exception as e:
            log_error(func.__name__, e)
            raise
    
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper
