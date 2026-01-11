import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime

from main import app
from src.database.database import Base, get_db
from src.models.task import Task, TaskStatus, TaskPriority

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    """Override the get_db dependency to use the test database."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override the get_db dependency in the app
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

class TestTaskAPI:
    """Integration tests for task API endpoints."""

    def test_create_task(self):
        """Test creating a new task."""
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "priority": "medium",
            "due_date": "2023-12-31T10:00:00"
        }

        response = client.post("/tasks/", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Task created successfully"
        assert "data" in data
        assert data["data"]["title"] == task_data["title"]
        assert data["data"]["description"] == task_data["description"]

    def test_create_task_missing_title(self):
        """Test creating a task without a title should fail."""
        task_data = {
            "description": "Test Description",
            "priority": "medium"
        }

        response = client.post("/tasks/", json=task_data)
        assert response.status_code == 422  # Validation error

    def test_create_task_invalid_title_length(self):
        """Test creating a task with an invalid title length should fail."""
        task_data = {
            "title": "a" * 256,  # Too long
            "description": "Test Description",
            "priority": "medium"
        }

        response = client.post("/tasks/", json=task_data)
        assert response.status_code == 400  # Validation error

    def test_get_tasks(self):
        """Test retrieving a list of tasks."""
        # First create a task
        task_data = {
            "title": "Test Task for Listing",
            "description": "Test Description",
            "priority": "high"
        }
        create_response = client.post("/tasks/", json=task_data)
        assert create_response.status_code == 200

        # Then retrieve the list
        response = client.get("/tasks/")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "tasks" in data["data"]
        assert len(data["data"]["tasks"]) >= 1

    def test_get_task_by_id(self):
        """Test retrieving a specific task by ID."""
        # First create a task
        task_data = {
            "title": "Test Task for Retrieval",
            "description": "Test Description",
            "priority": "low"
        }
        create_response = client.post("/tasks/", json=task_data)
        assert create_response.status_code == 200
        created_task = create_response.json()["data"]
        task_id = created_task["id"]

        # Then retrieve it by ID
        response = client.get(f"/tasks/{task_id}")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert data["data"]["id"] == task_id
        assert data["data"]["title"] == task_data["title"]

    def test_update_task(self):
        """Test updating an existing task."""
        # First create a task
        task_data = {
            "title": "Original Task",
            "description": "Original Description",
            "priority": "medium"
        }
        create_response = client.post("/tasks/", json=task_data)
        assert create_response.status_code == 200
        created_task = create_response.json()["data"]
        task_id = created_task["id"]

        # Then update it
        update_data = {
            "title": "Updated Task",
            "description": "Updated Description",
            "priority": "high"
        }
        response = client.put(f"/tasks/{task_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert data["data"]["title"] == update_data["title"]
        assert data["data"]["description"] == update_data["description"]
        assert data["data"]["priority"] == update_data["priority"]

    def test_delete_task(self):
        """Test deleting an existing task."""
        # First create a task
        task_data = {
            "title": "Task to Delete",
            "description": "Description to Delete",
            "priority": "medium"
        }
        create_response = client.post("/tasks/", json=task_data)
        assert create_response.status_code == 200
        created_task = create_response.json()["data"]
        task_id = created_task["id"]

        # Then delete it
        response = client.delete(f"/tasks/{task_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Task deleted successfully"

        # Verify it's gone
        get_response = client.get(f"/tasks/{task_id}")
        assert get_response.status_code == 404