from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.task_routes import router as task_router
from src.api.tag_routes import router as tag_router
from src.api.user_routes import router as user_router
from src.api.users import router as users_router
from src.api.user_auth_routes import router as user_auth_router
from src.database.connection import engine
from src.database.base import Base
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

# Add CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # expose_headers=["Access-Control-Allow-Origin"]
)

# Include API routers
app.include_router(task_router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(tag_router, prefix="/api/v1/tags", tags=["tags"])
app.include_router(user_router, prefix="/api/v1/user", tags=["user"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(user_auth_router, prefix="/api/v1/auth", tags=["auth"])


@app.get("/")
def read_root():
    return {"Hello": "Welcome to the Todo API!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)