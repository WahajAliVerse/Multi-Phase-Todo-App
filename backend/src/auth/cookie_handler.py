"""
Secure token storage handler for the application.

This module implements secure token storage using HTTP-only cookies
with security flags as specified in the requirements.
"""

from fastapi import Response
from typing import Optional
import logging


def set_auth_cookie(
    response: Response,
    token: str,
    max_age: Optional[int] = 1800,  # 30 minutes default
    secure: bool = True,  # Should be True in production (HTTPS)
    httponly: bool = True,  # Prevents client-side JS access
    samesite: str = "lax"  # CSRF protection
) -> Response:
    """
    Set an HTTP-only authentication cookie with security best practices.
    
    Args:
        response: FastAPI response object
        token: The JWT token to store
        max_age: Cookie max age in seconds (default: 1800 for 30 minutes)
        secure: Whether to set secure flag (default: True)
        httponly: Whether to set HttpOnly flag (default: True)
        samesite: SameSite attribute value (default: "lax")
        
    Returns:
        Response object with cookie set
    """
    logger = logging.getLogger(__name__)
    
    try:
        response.set_cookie(
            key="access_token_cookie",
            value=token,
            max_age=max_age,
            expires=None,  # Cookie expires when max_age is reached
            path="/",
            domain=None,  # Use default domain
            secure=secure,  # Only send over HTTPS
            httponly=httponly,  # Prevent client-side JS access
            samesite=samesite  # CSRF protection
        )
        
        logger.info("Authentication cookie set successfully")
        return response
        
    except Exception as e:
        logger.error(f"Error setting authentication cookie: {e}")
        raise


def clear_auth_cookie(
    response: Response,
    path: str = "/",
    domain: Optional[str] = None
) -> Response:
    """
    Clear the authentication cookie.
    
    Args:
        response: FastAPI response object
        path: Cookie path (default: "/")
        domain: Cookie domain (default: None)
        
    Returns:
        Response object with cookie cleared
    """
    logger = logging.getLogger(__name__)
    
    try:
        # Delete the cookie by setting its max_age to 0 and past expiration
        response.set_cookie(
            key="access_token_cookie",
            value="",
            max_age=0,
            expires="Thu, 01 Jan 1970 00:00:00 GMT",
            path=path,
            domain=domain,
            secure=True,
            httponly=True,
            samesite="lax"
        )
        
        logger.info("Authentication cookie cleared successfully")
        return response
        
    except Exception as e:
        logger.error(f"Error clearing authentication cookie: {e}")
        raise


def get_token_from_request(request) -> Optional[str]:
    """
    Get the token from the request cookie.
    
    Args:
        request: FastAPI request object
        
    Returns:
        Token string if found, None otherwise
    """
    logger = logging.getLogger(__name__)
    
    try:
        token = request.cookies.get("access_token_cookie")
        if not token:
            logger.debug("No authentication token found in request cookies")
            return None
        
        logger.debug("Authentication token retrieved from request")
        return token
        
    except Exception as e:
        logger.error(f"Error getting token from request: {e}")
        return None