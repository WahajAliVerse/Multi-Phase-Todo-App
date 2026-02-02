from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.api_v1.api import api_router
from .config import settings  # Updated import to use new config
from .errors import (
    validation_exception_handler,
    app_exception_handler,
    http_exception_handler,
    general_exception_handler,
    RequestValidationError,
    AppException
)
from starlette.exceptions import HTTPException as StarletteHTTPException


app = FastAPI(
    title=settings.APP_NAME,  # Updated to use new config
    debug=settings.DEBUG,
    openapi_url="/openapi.json"  # Simplified openapi URL
)

# Register exception handlers
app.exception_handler(RequestValidationError)(validation_exception_handler)
app.exception_handler(AppException)(app_exception_handler)
app.exception_handler(StarletteHTTPException)(http_exception_handler)
app.exception_handler(Exception)(general_exception_handler)

# Configure FastAPI CORS middleware to allow specific origins with credentials support
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],  # More specific methods
        allow_headers=["*"],
        # Expose headers related to cookies to frontend
        expose_headers=["Access-Control-Allow-Origin", "Set-Cookie", "Access-Control-Allow-Credentials"]
    )
else:
    # In production, if no origins are specified, we should be restrictive
    if settings.ENVIRONMENT == "production":
        print("WARNING: No CORS origins specified in production!")
    # For development, allow all origins
    else:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
            # Expose headers related to cookies to frontend
            expose_headers=["Access-Control-Allow-Origin", "Set-Cookie", "Access-Control-Allow-Credentials"]
        )

app.include_router(api_router, prefix="/api/v1")  # Using fixed prefix


@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo App API"}