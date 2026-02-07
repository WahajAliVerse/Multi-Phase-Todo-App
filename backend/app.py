from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import importlib
import pkgutil
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

app = FastAPI(title="Multi-Phase Todo Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include API routers
from src.api.auth import router as auth_router
from src.api.tasks import router as tasks_router
from src.api.tags import router as tags_router
from src.api.notifications import router as notifications_router

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(tags_router)
app.include_router(notifications_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Multi-Phase Todo Backend API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
def on_startup():
    from src.core.database import init_db
    init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)