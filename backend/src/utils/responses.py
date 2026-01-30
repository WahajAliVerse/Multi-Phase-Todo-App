from typing import Any, Dict, Optional
from fastapi import Response
from fastapi.responses import StreamingResponse
import json


def create_success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200,
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create a standardized success response
    """
    response = {
        "success": True,
        "message": message,
        "data": data,
        "status_code": status_code
    }
    
    if meta:
        response["meta"] = meta
    
    return response


def create_error_response(
    message: str = "An error occurred",
    error_code: Optional[str] = None,
    details: Optional[Any] = None,
    status_code: int = 400
) -> Dict[str, Any]:
    """
    Create a standardized error response
    """
    response = {
        "success": False,
        "message": message,
        "status_code": status_code
    }
    
    if error_code:
        response["error_code"] = error_code
    
    if details:
        response["details"] = details
    
    return response


def create_paginated_response(
    data: Any,
    page: int,
    page_size: int,
    total_items: int,
    message: str = "Success"
) -> Dict[str, Any]:
    """
    Create a standardized paginated response
    """
    total_pages = (total_items + page_size - 1) // page_size  # Ceiling division
    
    return {
        "success": True,
        "message": message,
        "data": data,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        },
        "status_code": 200
    }


def set_custom_headers(response: Response, headers: Dict[str, str]):
    """
    Set custom headers in the response
    """
    for key, value in headers.items():
        response.headers[key] = value


def create_streaming_response(data_generator, media_type: str = "application/json"):
    """
    Create a streaming response for large data sets
    """
    async def generate():
        async for chunk in data_generator:
            yield json.dumps(chunk).encode() + b"\n"
    
    return StreamingResponse(generate(), media_type=media_type)