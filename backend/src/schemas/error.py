from typing import Optional
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    """
    Standardized error response format for the API.
    """
    detail: str
    error_code: Optional[str] = None
    remediation: Optional[str] = None

class ValidationErrorResponse(ErrorResponse):
    """
    Error response for validation errors.
    """
    loc: Optional[list] = None  # Location of the validation error