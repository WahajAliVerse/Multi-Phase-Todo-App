from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.api_v1.api import api_router
from src.core.config import settings
from src.errors import (
    validation_exception_handler,
    app_exception_handler,
    http_exception_handler,
    general_exception_handler,
    RequestValidationError,
    AppException
)
from starlette.exceptions import HTTPException as StarletteHTTPException
from src.database.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Register exception handlers
app.exception_handler(RequestValidationError)(validation_exception_handler)
app.exception_handler(AppException)(app_exception_handler)
app.exception_handler(StarletteHTTPException)(http_exception_handler)
app.exception_handler(Exception)(general_exception_handler)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        # Expose headers related to cookies to frontend
        expose_headers=["Access-Control-Allow-Origin", "Set-Cookie", "Access-Control-Allow-Credentials"]
    )
else:
    # For development, allow all origins with credentials
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        # Expose headers related to cookies to frontend
        expose_headers=["Access-Control-Allow-Origin", "Set-Cookie", "Access-Control-Allow-Credentials"]
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo App API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}