"""
Centralized error handling for the application.

This module implements standardized error responses containing error codes,
messages, and remediation steps as specified in the requirements.
"""

from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from fastapi.encoders import jsonable_encoder
import traceback
import logging


# Configure logging
logger = logging.getLogger(__name__)


class AppException(HTTPException):
    """
    Custom application exception class.
    
    This class extends HTTPException to provide additional context
    and structured error information.
    """
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


class ErrorResponse:
    """
    Standardized error response structure.
    """
    def __init__(
        self,
        success: bool = False,
        error_code: str = None,
        message: str = None,
        details: Dict[str, Any] = None
    ):
        self.success = success
        self.error_code = error_code
        self.message = message
        self.details = details or {}

    def dict(self):
        return {
            "success": self.success,
            "error_code": self.error_code,
            "message": self.message,
            "details": self.details
        }


async def validation_exception_handler(request: Request, exc: ValidationError):
    """
    Handler for validation exceptions.
    
    Args:
        request: The incoming request
        exc: The validation exception
    
    Returns:
        JSONResponse with standardized error format
    """
    logger.error(f"Validation error: {exc}")
    
    error_details = {
        "errors": exc.errors(),
        "body": exc.body
    }
    
    error_response = ErrorResponse(
        success=False,
        error_code="VALIDATION_ERROR",
        message="Request validation failed",
        details=error_details
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.dict()
    )


async def app_exception_handler(request: Request, exc: AppException):
    """
    Handler for custom application exceptions.
    
    Args:
        request: The incoming request
        exc: The application exception
    
    Returns:
        JSONResponse with standardized error format
    """
    logger.error(f"Application error: {exc.detail}")
    
    error_response = ErrorResponse(
        success=False,
        error_code=exc.error_code,
        message=exc.detail
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.dict()
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Handler for HTTP exceptions.
    
    Args:
        request: The incoming request
        exc: The HTTP exception
    
    Returns:
        JSONResponse with standardized error format
    """
    logger.warning(f"HTTP error: {exc.detail}")
    
    error_response = ErrorResponse(
        success=False,
        error_code=getattr(exc, 'error_code', 'HTTP_ERROR'),
        message=str(exc.detail)
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.dict()
    )


async def general_exception_handler(request: Request, exc: Exception):
    """
    Handler for general exceptions.
    
    Args:
        request: The incoming request
        exc: The general exception
    
    Returns:
        JSONResponse with standardized error format
    """
    logger.error(f"General error: {exc}\n{traceback.format_exc()}")
    
    error_response = ErrorResponse(
        success=False,
        error_code="INTERNAL_ERROR",
        message="An internal server error occurred"
    )
    
    # In development, include more details about the error
    if hasattr(request.app.state, 'debug') and request.app.state.debug:
        error_response.details = {
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "traceback": traceback.format_exc()
        }
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.dict()
    )


def log_error(error: Exception, context: str = ""):
    """
    Log an error with additional context.
    
    Args:
        error: The error to log
        context: Additional context information
    """
    logger.error(f"Error in {context}: {error}\n{traceback.format_exc()}")


def create_error_response(
    status_code: int,
    error_code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> JSONResponse:
    """
    Helper function to create a standardized error response.
    
    Args:
        status_code: HTTP status code
        error_code: Application-specific error code
        message: Error message
        details: Additional error details
    
    Returns:
        JSONResponse with standardized error format
    """
    error_response = ErrorResponse(
        success=False,
        error_code=error_code,
        message=message,
        details=details or {}
    )
    
    return JSONResponse(
        status_code=status_code,
        content=error_response.dict()
    )