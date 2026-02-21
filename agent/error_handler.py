"""
Error Handler for AI Task Assistant

Provides comprehensive error handling with retry logic, exponential backoff,
and user-friendly error messages.
"""

import asyncio
import time
from functools import wraps
from typing import Callable, Any, Optional, Dict, Type, List
from openai import APIError, APITimeoutError, APIConnectionError, RateLimitError, AuthenticationError

# Handle both relative and absolute imports
try:
    from .logger import agent_logger, log_error
except (ImportError, ModuleNotFoundError):
    from logger import agent_logger, log_error


# ============================================================================
# Error Code Constants
# ============================================================================

class ErrorCodes:
    """Standardized error codes for API responses."""
    # Client Errors (4xx)
    INVALID_INPUT = "INVALID_INPUT"
    TASK_NOT_FOUND = "TASK_NOT_FOUND"
    TAG_NOT_FOUND = "TAG_NOT_FOUND"
    CONVERSATION_NOT_FOUND = "CONVERSATION_NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    RATE_LIMITED = "RATE_LIMITED"
    CLARIFICATION_NEEDED = "CLARIFICATION_NEEDED"
    CONFIRMATION_REQUIRED = "CONFIRMATION_REQUIRED"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    
    # Server Errors (5xx)
    LLM_ERROR = "LLM_ERROR"
    BACKEND_ERROR = "BACKEND_ERROR"
    TOOL_EXECUTION_ERROR = "TOOL_EXECUTION_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"


# ============================================================================
# Error Code to User Message Mapping
# ============================================================================

ERROR_MESSAGE_MAP: Dict[str, str] = {
    # Authentication & Authorization
    ErrorCodes.UNAUTHORIZED: "Please log in to continue.",
    ErrorCodes.FORBIDDEN: "You don't have permission to perform this action.",
    
    # Not Found Errors
    ErrorCodes.TASK_NOT_FOUND: "I couldn't find that task. It may have been deleted or doesn't exist.",
    ErrorCodes.TAG_NOT_FOUND: "I couldn't find that tag. It may have been deleted.",
    ErrorCodes.CONVERSATION_NOT_FOUND: "I couldn't find that conversation.",
    
    # Input Errors
    ErrorCodes.INVALID_INPUT: "There was an issue with your request. Please try again.",
    ErrorCodes.VALIDATION_ERROR: "Some information is missing or invalid. Please check and try again.",
    ErrorCodes.CLARIFICATION_NEEDED: "I need a bit more information to help you accurately. Could you please clarify?",
    ErrorCodes.CONFIRMATION_REQUIRED: "Please confirm this action before I proceed.",
    
    # Rate Limiting
    ErrorCodes.RATE_LIMITED: "Too many requests. Please wait a moment before trying again.",
    
    # Server Errors
    ErrorCodes.LLM_ERROR: "I'm having trouble processing your request right now. Please try again in a moment.",
    ErrorCodes.BACKEND_ERROR: "Something went wrong on our end. Please try again later.",
    ErrorCodes.TOOL_EXECUTION_ERROR: "I encountered an issue while performing that action. Please try again.",
    ErrorCodes.INTERNAL_ERROR: "An unexpected error occurred. Please try again.",
    ErrorCodes.SERVICE_UNAVAILABLE: "The service is temporarily unavailable. Please try again later.",
}


# ============================================================================
# Exception Classes
# ============================================================================

class AgentError(Exception):
    """Base exception for AI Agent errors."""

    def __init__(self, message: str, code: str = "AGENT_ERROR", details: Dict = None):
        self.message = message
        self.code = code
        self.details = details or {}
        self.user_message = ERROR_MESSAGE_MAP.get(code, "An unexpected error occurred. Please try again.")
        super().__init__(self.message)
    
    def to_dict(self) -> Dict:
        """Convert error to dictionary for API response."""
        return {
            "success": False,
            "error": {
                "code": self.code,
                "message": self.message,
                "user_message": self.user_message,
                "details": self.details
            }
        }


class LLMError(AgentError):
    """Error from LLM (Gemini) API."""

    def __init__(self, message: str, details: Dict = None):
        super().__init__(message, code=ErrorCodes.LLM_ERROR, details=details)


class BackendError(AgentError):
    """Error from backend API."""

    def __init__(self, message: str, status_code: int = None, details: Dict = None):
        code = ErrorCodes.BACKEND_ERROR
        if status_code:
            if status_code == 404:
                code = ErrorCodes.TASK_NOT_FOUND if "task" in message.lower() else ErrorCodes.CONVERSATION_NOT_FOUND
            elif status_code == 403:
                code = ErrorCodes.FORBIDDEN
            elif status_code == 401:
                code = ErrorCodes.UNAUTHORIZED
            elif status_code == 429:
                code = ErrorCodes.RATE_LIMITED
            elif status_code >= 500:
                code = ErrorCodes.SERVICE_UNAVAILABLE
        
        super().__init__(message, code=code, details={**(details or {}), "status_code": status_code})
        self.status_code = status_code


class ToolExecutionError(AgentError):
    """Error during tool execution."""

    def __init__(self, tool_name: str, message: str, details: Dict = None):
        super().__init__(
            f"Tool '{tool_name}' failed: {message}",
            code=ErrorCodes.TOOL_EXECUTION_ERROR,
            details={"tool_name": tool_name, **(details or {})}
        )
        self.tool_name = tool_name


class ClarificationNeededError(AgentError):
    """Intent is ambiguous and requires user clarification."""

    def __init__(self, questions: List[str], context: Dict = None):
        super().__init__(
            "Clarification needed",
            code=ErrorCodes.CLARIFICATION_NEEDED,
            details={"questions": questions, **(context or {})}
        )
        self.questions = questions


class ValidationError(AgentError):
    """Validation error for input data."""

    def __init__(self, tool_name: str, message: str, details: Dict = None):
        super().__init__(
            f"Validation failed for '{tool_name}': {message}",
            code=ErrorCodes.VALIDATION_ERROR,
            details={"tool_name": tool_name, **(details or {})}
        )
        self.tool_name = tool_name


class NotFoundError(AgentError):
    """Resource not found error."""

    def __init__(self, resource_type: str, resource_id: str = None, details: Dict = None):
        code_map = {
            "task": ErrorCodes.TASK_NOT_FOUND,
            "tag": ErrorCodes.TAG_NOT_FOUND,
            "conversation": ErrorCodes.CONVERSATION_NOT_FOUND,
        }
        code = code_map.get(resource_type.lower(), ErrorCodes.INTERNAL_ERROR)
        message = f"{resource_type.capitalize()} not found"
        if resource_id:
            message += f": {resource_id}"
        
        super().__init__(message, code=code, details={**(details or {}), "resource_type": resource_type, "resource_id": resource_id})
        self.resource_type = resource_type
        self.resource_id = resource_id


# ============================================================================
# User-Friendly Message Functions
# ============================================================================

def get_user_friendly_message(error: Exception) -> str:
    """
    Convert technical error messages to user-friendly messages.

    Args:
        error: Exception instance

    Returns:
        User-friendly error message
    """
    if isinstance(error, AgentError):
        return error.user_message
    
    if isinstance(error, ClarificationNeededError):
        return "I need a bit more information to help you accurately. Could you please clarify?"

    if isinstance(error, LLMError):
        return "I'm having trouble processing your request right now. Please try again in a moment."

    if isinstance(error, BackendError):
        if error.status_code == 404:
            return "I couldn't find that item. It may have been deleted or doesn't exist."
        elif error.status_code == 403:
            return "You don't have permission to perform this action."
        elif error.status_code == 401:
            return "Please log in to continue."
        elif error.status_code == 429:
            return "Too many requests. Please wait a moment before trying again."
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

    if isinstance(error, AuthenticationError):
        return "Authentication failed. Please check your API key configuration."

    # Default message
    return "An unexpected error occurred. Please try again."


def get_error_code(error: Exception) -> str:
    """
    Extract error code from exception.

    Args:
        error: Exception instance

    Returns:
        Error code string
    """
    if isinstance(error, AgentError):
        return error.code
    
    if isinstance(error, RateLimitError):
        return ErrorCodes.RATE_LIMITED
    
    if isinstance(error, APITimeoutError):
        return ErrorCodes.LLM_ERROR
    
    if isinstance(error, APIConnectionError):
        return ErrorCodes.SERVICE_UNAVAILABLE
    
    if isinstance(error, AuthenticationError):
        return ErrorCodes.UNAUTHORIZED
    
    if isinstance(error, APIError):
        return ErrorCodes.LLM_ERROR
    
    return ErrorCodes.INTERNAL_ERROR


# ============================================================================
# Retry Logic with Exponential Backoff
# ============================================================================

def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 10.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    retryable_exceptions: tuple = (APITimeoutError, APIConnectionError, RateLimitError)
):
    """
    Decorator for retrying functions with exponential backoff.

    Args:
        max_retries: Maximum number of retry attempts (default: 3)
        base_delay: Initial delay in seconds (default: 1.0)
        max_delay: Maximum delay in seconds (default: 10.0)
        exponential_base: Base for exponential backoff (default: 2.0)
        jitter: Add random jitter to delay to prevent thundering herd (default: True)
        retryable_exceptions: Tuple of exceptions that trigger retries

    Returns:
        Decorated function with retry logic

    Example:
        @retry_with_backoff(max_retries=3, base_delay=1.0)
        async def fetch_data():
            ...
    """
    import random
    
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

                    # Calculate delay with exponential backoff
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)
                    
                    # Add jitter to prevent thundering herd
                    if jitter:
                        delay = delay * (0.5 + random.random())
                    
                    agent_logger.warning(
                        f"Attempt {attempt + 1}/{max_retries + 1} failed for '{func.__name__}'. "
                        f"Retrying in {delay:.1f}s... Error: {type(e).__name__}: {e}"
                    )
                    await asyncio.sleep(delay)
                except Exception as e:
                    # Non-retryable exception - log and raise
                    log_error(func.__name__, e)
                    raise

            # All retries exhausted
            raise LLMError(
                f"Failed after {max_retries + 1} attempts: {last_exception}",
                details={
                    "last_error": str(last_exception),
                    "error_type": type(last_exception).__name__,
                    "max_retries": max_retries
                }
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

                    # Calculate delay with exponential backoff
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)
                    
                    # Add jitter to prevent thundering herd
                    if jitter:
                        delay = delay * (0.5 + random.random())
                    
                    agent_logger.warning(
                        f"Attempt {attempt + 1}/{max_retries + 1} failed for '{func.__name__}'. "
                        f"Retrying in {delay:.1f}s... Error: {type(e).__name__}: {e}"
                    )
                    time.sleep(delay)
                except Exception as e:
                    # Non-retryable exception - log and raise
                    log_error(func.__name__, e)
                    raise

            # All retries exhausted
            raise LLMError(
                f"Failed after {max_retries + 1} attempts: {last_exception}",
                details={
                    "last_error": str(last_exception),
                    "error_type": type(last_exception).__name__,
                    "max_retries": max_retries
                }
            )

        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


# ============================================================================
# Error Handling Decorators
# ============================================================================

def handle_llm_errors(func: Callable) -> Callable:
    """
    Decorator to handle LLM API errors gracefully.

    Converts OpenAI API errors to AgentError with user-friendly messages.
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except AuthenticationError as e:
            log_error(func.__name__, e)
            raise AgentError(
                f"Authentication failed: {e}",
                code=ErrorCodes.UNAUTHORIZED,
                details={"error_type": "AuthenticationError"}
            )
        except RateLimitError as e:
            log_error(func.__name__, e)
            raise AgentError(
                f"Rate limit exceeded: {e}",
                code=ErrorCodes.RATE_LIMITED,
                details={"error_type": "RateLimitError"}
            )
        except APITimeoutError as e:
            log_error(func.__name__, e)
            raise AgentError(
                f"Request timed out: {e}",
                code=ErrorCodes.LLM_ERROR,
                details={"error_type": "APITimeoutError"}
            )
        except APIConnectionError as e:
            log_error(func.__name__, e)
            raise AgentError(
                f"Connection failed: {e}",
                code=ErrorCodes.SERVICE_UNAVAILABLE,
                details={"error_type": "APIConnectionError"}
            )
        except APIError as e:
            log_error(func.__name__, e)
            raise LLMError(
                str(e),
                details={"status_code": getattr(e, 'status_code', None), "error_type": "APIError"}
            )
        except Exception as e:
            log_error(func.__name__, e)
            raise

    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except AuthenticationError as e:
            log_error(func.__name__, e)
            raise AgentError(
                f"Authentication failed: {e}",
                code=ErrorCodes.UNAUTHORIZED,
                details={"error_type": "AuthenticationError"}
            )
        except RateLimitError as e:
            log_error(func.__name__, e)
            raise AgentError(
                f"Rate limit exceeded: {e}",
                code=ErrorCodes.RATE_LIMITED,
                details={"error_type": "RateLimitError"}
            )
        except APITimeoutError as e:
            log_error(func.__name__, e)
            raise AgentError(
                f"Request timed out: {e}",
                code=ErrorCodes.LLM_ERROR,
                details={"error_type": "APITimeoutError"}
            )
        except APIConnectionError as e:
            log_error(func.__name__, e)
            raise AgentError(
                f"Connection failed: {e}",
                code=ErrorCodes.SERVICE_UNAVAILABLE,
                details={"error_type": "APIConnectionError"}
            )
        except APIError as e:
            log_error(func.__name__, e)
            raise LLMError(
                str(e),
                details={"status_code": getattr(e, 'status_code', None), "error_type": "APIError"}
            )
        except Exception as e:
            log_error(func.__name__, e)
            raise

    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper


# ============================================================================
# Error Response Builder
# ============================================================================

def build_error_response(error: Exception, include_details: bool = False) -> Dict:
    """
    Build a standardized error response for API.

    Args:
        error: Exception instance
        include_details: Whether to include error details (for debug mode)

    Returns:
        Dictionary with error response structure
    """
    response = {
        "success": False,
        "error": {
            "code": get_error_code(error),
            "message": str(error),
            "user_message": get_user_friendly_message(error),
        }
    }
    
    if include_details and isinstance(error, AgentError) and error.details:
        response["error"]["details"] = error.details
    
    return response
