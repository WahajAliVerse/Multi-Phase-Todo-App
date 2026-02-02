"""
Authentication middleware for the application.

This module implements authentication middleware to protect routes using
cookie-based token validation as specified in the requirements.
"""

from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..services.auth_service import AuthService
from ..utils.responses import create_error_response
import logging


class AuthMiddleware:
    """
    Middleware class for handling authentication.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.security = HTTPBearer(auto_error=False)

    async def __call__(self, request: Request, call_next):
        """
        Process the request and check for authentication.
        
        Args:
            request: FastAPI request object
            call_next: Function to call the next middleware/route
            
        Returns:
            Response from the next middleware/route or an error response
        """
        # Skip authentication for public routes
        if self.is_public_route(request.url.path):
            response = await call_next(request)
            return response
        
        # Get token from cookie
        token = request.cookies.get("access_token_cookie")
        
        if not token:
            self.logger.warning(f"No authentication token found for {request.method} {request.url.path}")
            return create_error_response(
                error_code="NO_AUTH_TOKEN",
                message="No authentication token provided",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        
        # Create a database session to verify the token
        try:
            # Create a database session
            db_gen = get_db()
            db: Session = next(db_gen)
            
            try:
                # Verify the token and get the user
                auth_service = AuthService(db)
                user = auth_service.get_current_user(token)
                
                if not user:
                    self.logger.warning(f"Invalid token for {request.method} {request.url.path}")
                    return create_error_response(
                        error_code="INVALID_TOKEN",
                        message="Invalid or expired token",
                        status_code=status.HTTP_401_UNAUTHORIZED
                    )
                
                # Add user to request state for use in route handlers
                request.state.user = user
                request.state.user_id = user.id
                
                # Continue with the request
                response = await call_next(request)
                return response
                
            finally:
                # Close the database session
                db.close()
                
        except Exception as e:
            self.logger.error(f"Error in authentication middleware: {e}")
            return create_error_response(
                error_code="INTERNAL_ERROR",
                message="An internal server error occurred during authentication",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def is_public_route(self, path: str) -> bool:
        """
        Check if the route is public and doesn't require authentication.
        
        Args:
            path: The request path
            
        Returns:
            bool: True if the route is public, False otherwise
        """
        public_routes = [
            "/auth/login",
            "/auth/register",
            "/auth/refresh",  # If you have a refresh endpoint
            "/health",
            "/",  # Root endpoint
            "/docs",  # Swagger docs
            "/redoc",  # ReDoc
            "/openapi.json"  # OpenAPI spec
        ]
        
        # Check if the path starts with any of the public routes
        for public_route in public_routes:
            if path.startswith(public_route):
                return True
        
        return False


# Create an instance of the middleware
auth_middleware = AuthMiddleware()