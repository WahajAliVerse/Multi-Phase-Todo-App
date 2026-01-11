import logging
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, Any

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def log_error(error: Exception, context: str = ""):
    """Log error with context."""
    logger.error(f"Error in {context}: {str(error)}", exc_info=True)

def handle_error(error: Exception, context: str = "", default_response: Dict[str, Any] = None):
    """Generic error handler that logs and returns appropriate response."""
    log_error(error, context)
    
    # Return a default response or a generic error message
    if default_response:
        return default_response
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "type": "InternalServerError",
                "message": "An unexpected error occurred",
                "context": context
            }
        }
    )

def handle_http_error(status_code: int, detail: str, headers: Dict[str, str] = None):
    """Raise an HTTPException with proper error details."""
    logger.warning(f"HTTP Error {status_code}: {detail}")
    raise HTTPException(
        status_code=status_code,
        detail={
            "error": {
                "type": "HTTPError",
                "message": detail,
                "status_code": status_code
            }
        },
        headers=headers
    )

def validate_input(data: Dict[str, Any], required_fields: list, field_validations: Dict[str, callable] = None):
    """Validate input data for required fields and custom validations."""
    errors = []
    
    # Check required fields
    for field in required_fields:
        if field not in data or data[field] is None:
            errors.append(f"Missing required field: {field}")
    
    # Run custom validations
    if field_validations:
        for field, validator in field_validations.items():
            if field in data and data[field] is not None:
                try:
                    validator(data[field])
                except ValueError as e:
                    errors.append(f"Invalid value for {field}: {str(e)}")
    
    if errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": {"type": "ValidationError", "messages": errors}}
        )

def sanitize_input(input_str: str) -> str:
    """Sanitize input string to prevent injection attacks."""
    # Remove potentially dangerous characters
    sanitized = input_str.replace('<', '&lt;').replace('>', '&gt;')
    return sanitized.strip()

def rate_limit_handler(request, key_func=None):
    """Handle rate limiting for API endpoints."""
    # This is a placeholder for a rate limiting implementation
    # In a real application, you would use a library like slowapi or implement
    # rate limiting using Redis or similar
    pass