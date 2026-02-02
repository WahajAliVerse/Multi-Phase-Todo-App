"""
Token refresh functionality for the application.

This module implements token refresh functionality with HTTP-only cookie updates
maintaining security flags as specified in the requirements.
"""

from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer
from ..database import get_db
from ..services.auth_service import AuthService
from ..utils.responses import create_success_response, create_error_response
import logging


router = APIRouter()

# Security scheme for documentation purposes
security_scheme = HTTPBearer()


@router.post("/refresh")
def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Refresh the authentication token.
    
    Args:
        request: FastAPI request object to get cookies
        response: FastAPI response object to set cookies
        db: Database session dependency
        
    Returns:
        Success response with refreshed token
    """
    logger = logging.getLogger(__name__)
    
    try:
        # Get the current token from the cookie
        current_token = request.cookies.get("access_token_cookie")
        
        if not current_token:
            return create_error_response(
                error_code="NO_AUTH_TOKEN",
                message="No authentication token provided",
                status_code=401
            )
        
        # Create auth service instance
        auth_service = AuthService(db)
        
        # Attempt to refresh the token
        new_token = auth_service.refresh_token(current_token)
        
        if not new_token:
            # Clear the old cookie if refresh failed
            response.delete_cookie(
                key="access_token_cookie",
                path="/",
                domain=None
            )
            return create_error_response(
                error_code="TOKEN_REFRESH_FAILED",
                message="Token refresh failed. Please log in again.",
                status_code=401
            )
        
        # Set the new token in the cookie with security flags
        response.set_cookie(
            key="access_token_cookie",
            value=new_token,
            httponly=True,  # Prevents client-side JavaScript access
            secure=True,    # Only sent over HTTPS (should be configurable for dev/prod)
            samesite="lax", # Protects against CSRF
            max_age=1800    # 30 minutes in seconds
        )
        
        return create_success_response(
            message="Token refreshed successfully"
        )
        
    except Exception as e:
        logger.error(f"Error during token refresh: {e}")
        return create_error_response(
            error_code="INTERNAL_ERROR",
            message="An internal server error occurred",
            status_code=500
        )