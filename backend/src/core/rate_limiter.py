from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request


# Initialize the rate limiter with remote address as the key
limiter = Limiter(key_func=get_remote_address)


def setup_rate_limiter(app: FastAPI):
    """
    Set up the rate limiter for the FastAPI application
    """
    # Register the rate limit exceeded handler
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


def get_rate_limit_config():
    """
    Return the default rate limit configuration
    """
    return {
        "default_limits": ["1000 per hour", "100 per minute"],
        "auth_endpoint_limits": ["50 per hour", "10 per minute"],  # Lower limits for auth endpoints
        "api_endpoint_limits": ["200 per hour", "30 per minute"],   # Standard limits for API endpoints
    }


# Common rate limit decorators
def rate_limit_default(func):
    """Apply default rate limiting to an endpoint"""
    return limiter.limit("100 per minute")(func)


def rate_limit_auth(func):
    """Apply authentication-specific rate limiting to an endpoint"""
    return limiter.limit("10 per minute")(func)


def rate_limit_api(func):
    """Apply API-specific rate limiting to an endpoint"""
    return limiter.limit("50 per minute")(func)