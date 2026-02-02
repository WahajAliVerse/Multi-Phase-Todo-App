"""
API response utility functions.

This module creates standardized API response utility functions
to ensure consistent responses across the application.
"""

from typing import Any, Dict, Optional, Union
from fastapi import Response
from fastapi.responses import JSONResponse
import json


def create_success_response(
    data: Any = None,
    message: Optional[str] = None,
    status_code: int = 200,
    meta: Optional[Dict[str, Any]] = None
) -> JSONResponse:
    """
    Create a standardized success response.
    
    Args:
        data: The main data to return
        message: Optional success message
        status_code: HTTP status code (default: 200)
        meta: Optional metadata about the response
    
    Returns:
        JSONResponse with standardized success format
    """
    response_body = {
        "success": True,
        "data": data,
        "message": message
    }
    
    if meta:
        response_body["meta"] = meta
    
    return JSONResponse(
        status_code=status_code,
        content=response_body
    )


def create_paginated_response(
    data: Any,
    page: int,
    page_size: int,
    total_items: int,
    message: Optional[str] = None
) -> JSONResponse:
    """
    Create a standardized paginated response.
    
    Args:
        data: The paginated data to return
        page: Current page number
        page_size: Number of items per page
        total_items: Total number of items available
        message: Optional success message
    
    Returns:
        JSONResponse with standardized paginated format
    """
    total_pages = (total_items + page_size - 1) // page_size  # Ceiling division
    
    meta = {
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }
    
    return create_success_response(
        data=data,
        message=message,
        meta=meta
    )


def create_error_response(
    error_code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    status_code: int = 400
) -> JSONResponse:
    """
    Create a standardized error response.
    
    Args:
        error_code: Application-specific error code
        message: Error message
        details: Additional error details
        status_code: HTTP status code (default: 400)
    
    Returns:
        JSONResponse with standardized error format
    """
    response_body = {
        "success": False,
        "error_code": error_code,
        "message": message,
        "details": details or {}
    }
    
    return JSONResponse(
        status_code=status_code,
        content=response_body
    )


def format_response(
    success: bool,
    data: Any = None,
    message: Optional[str] = None,
    error_code: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Format a response dictionary without creating a JSONResponse object.
    
    Args:
        success: Whether the operation was successful
        data: The main data to return (for success responses)
        message: Success or error message
        error_code: Application-specific error code (for error responses)
        details: Additional error details (for error responses)
        meta: Optional metadata about the response
    
    Returns:
        Dictionary with standardized response format
    """
    response = {
        "success": success
    }
    
    if success:
        response["data"] = data
        if message:
            response["message"] = message
    else:
        response["error_code"] = error_code
        response["message"] = message
        response["details"] = details or {}
    
    if meta:
        response["meta"] = meta
    
    return response


def set_cookie_response(
    response: Response,
    key: str,
    value: str,
    max_age: Optional[int] = None,
    expires: Optional[str] = None,
    path: str = "/",
    domain: Optional[str] = None,
    secure: bool = True,
    httponly: bool = True,
    samesite: str = "Lax"
) -> Response:
    """
    Set a cookie on the response with security best practices.
    
    Args:
        response: FastAPI Response object
        key: Cookie name
        value: Cookie value
        max_age: Cookie max age in seconds
        expires: Cookie expiration date
        path: Cookie path
        domain: Cookie domain
        secure: Whether to set secure flag
        httponly: Whether to set HttpOnly flag
        samesite: SameSite attribute value
    
    Returns:
        Response object with cookie set
    """
    response.set_cookie(
        key=key,
        value=value,
        max_age=max_age,
        expires=expires,
        path=path,
        domain=domain,
        secure=secure,
        httponly=httponly,
        samesite=samesite
    )
    return response


def delete_cookie_response(
    response: Response,
    key: str,
    path: str = "/",
    domain: Optional[str] = None
) -> Response:
    """
    Delete a cookie from the response.
    
    Args:
        response: FastAPI Response object
        key: Cookie name to delete
        path: Cookie path
        domain: Cookie domain
    
    Returns:
        Response object with cookie deleted
    """
    response.delete_cookie(key=key, path=path, domain=domain)
    return response