from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import auth_router, user_router, task_router, tag_router, reminder_router
from src.database.database import engine, Base
import os
from dotenv import load_dotenv

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Todo App API",
    description="API for the Phase 2 Todo Application with authentication, task management, and advanced features",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default
        "http://localhost:3001",  # Alternative Next.js port
        "http://localhost:3002",  # Another alternative Next.js port
        "http://localhost:8000",  # For direct API access
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    # Allow Authorization header for JWT
    expose_headers=["Access-Control-Allow-Origin"]
)

# Include routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(task_router.router)
app.include_router(tag_router.router)
app.include_router(reminder_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo App API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}