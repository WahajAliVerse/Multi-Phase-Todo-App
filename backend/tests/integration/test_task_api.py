import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from backend.src.main import app
from backend.src.models.user import User
from backend.src.models.task import Task
from backend.src.core.security import get_password_hash
from uuid import uuid4
import json


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture():
    client = TestClient(app)
    yield client


@pytest.fixture(name="sample_user")
def sample_user_fixture():
    return User(
        id=uuid4(),
        email="testuser@example.com",
        hashed_password=get_password_hash("testpassword"),
        first_name="Test",
        last_name="User"
    )


@pytest.fixture(name="sample_task")
def sample_task_fixture(sample_user):
    return Task(
        id=uuid4(),
        title="Test Task",
        description="Test Description",
        status="pending",
        priority="medium",
        user_id=sample_user.id
    )


def test_create_task_integration(client: TestClient, session: Session, sample_user: User):
    """Test creating a task through the API"""
    # Add user to database
    session.add(sample_user)
    session.commit()
    
    # Prepare task data
    task_data = {
        "title": "Integration Test Task",
        "description": "Task created through API integration test",
        "status": "pending",
        "priority": "high",
        "user_id": str(sample_user.id)
    }
    
    # Make API request
    response = client.post("/api/tasks/", json=task_data)
    
    # Assertions
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["title"] == "Integration Test Task"
    assert response_data["description"] == "Task created through API integration test"
    assert response_data["status"] == "pending"
    assert response_data["priority"] == "high"
    assert response_data["user_id"] == str(sample_user.id)


def test_get_tasks_integration(client: TestClient, session: Session, sample_user: User, sample_task: Task):
    """Test retrieving tasks through the API"""
    # Add user and task to database
    session.add(sample_user)
    session.add(sample_task)
    session.commit()
    
    # Make API request
    response = client.get(f"/api/tasks/?user_id={sample_user.id}")
    
    # Assertions
    assert response.status_code == 200
    response_data = response.json()
    assert isinstance(response_data, list)
    assert len(response_data) == 1
    assert response_data[0]["title"] == "Test Task"
    assert response_data[0]["user_id"] == str(sample_user.id)


def test_update_task_integration(client: TestClient, session: Session, sample_user: User, sample_task: Task):
    """Test updating a task through the API"""
    # Add user and task to database
    session.add(sample_user)
    session.add(sample_task)
    session.commit()
    
    # Prepare update data
    update_data = {
        "title": "Updated Task Title",
        "status": "completed"
    }
    
    # Make API request
    response = client.put(f"/api/tasks/{sample_task.id}", json=update_data)
    
    # Assertions
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["title"] == "Updated Task Title"
    assert response_data["status"] == "completed"


def test_delete_task_integration(client: TestClient, session: Session, sample_user: User, sample_task: Task):
    """Test deleting a task through the API"""
    # Add user and task to database
    session.add(sample_user)
    session.add(sample_task)
    session.commit()
    
    # Verify task exists before deletion
    response = client.get(f"/api/tasks/?user_id={sample_user.id}")
    assert len(response.json()) == 1
    
    # Make API request to delete
    response = client.delete(f"/api/tasks/{sample_task.id}")
    
    # Assertions
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["message"] == "Task deleted successfully"
    
    # Verify task is gone
    response = client.get(f"/api/tasks/?user_id={sample_user.id}")
    assert len(response.json()) == 0


def test_authentication_required_for_task_operations(client: TestClient, session: Session, sample_user: User):
    """Test that authentication is required for task operations"""
    # Attempt to create task without authentication
    task_data = {
        "title": "Unauthorized Task",
        "description": "This should fail without auth",
        "status": "pending",
        "priority": "medium",
        "user_id": str(sample_user.id)
    }
    
    # Make API request without authentication
    response = client.post("/api/tasks/", json=task_data)
    
    # Should return 401 Unauthorized
    assert response.status_code == 401


def test_task_filtering_integration(client: TestClient, session: Session, sample_user: User):
    """Test filtering tasks by status, priority, etc."""
    # Add user to database
    session.add(sample_user)
    session.commit()
    
    # Create multiple tasks with different properties
    tasks_data = [
        {
            "title": "High Priority Task",
            "description": "High priority task",
            "status": "pending",
            "priority": "high",
            "user_id": str(sample_user.id)
        },
        {
            "title": "Completed Task",
            "description": "Already completed task",
            "status": "completed",
            "priority": "medium",
            "user_id": str(sample_user.id)
        },
        {
            "title": "Low Priority Task",
            "description": "Low priority task",
            "status": "pending",
            "priority": "low",
            "user_id": str(sample_user.id)
        }
    ]
    
    # Create tasks via API
    created_tasks = []
    for task_data in tasks_data:
        response = client.post("/api/tasks/", json=task_data)
        assert response.status_code == 200
        created_tasks.append(response.json())
    
    # Test filtering by status
    response = client.get(f"/api/tasks/?user_id={sample_user.id}&status=pending")
    assert response.status_code == 200
    pending_tasks = response.json()
    assert len(pending_tasks) == 2
    for task in pending_tasks:
        assert task["status"] == "pending"
    
    # Test filtering by priority
    response = client.get(f"/api/tasks/?user_id={sample_user.id}&priority=high")
    assert response.status_code == 200
    high_priority_tasks = response.json()
    assert len(high_priority_tasks) == 1
    assert high_priority_tasks[0]["priority"] == "high"
    
    # Test search functionality
    response = client.get(f"/api/tasks/?user_id={sample_user.id}&search=High")
    assert response.status_code == 200
    search_results = response.json()
    assert len(search_results) == 1
    assert "High" in search_results[0]["title"]


def test_task_sorting_integration(client: TestClient, session: Session, sample_user: User):
    """Test sorting tasks by different criteria"""
    # Add user to database
    session.add(sample_user)
    session.commit()
    
    # Create tasks with different titles and priorities
    tasks_data = [
        {
            "title": "Alpha Task",
            "description": "First alphabetically",
            "status": "pending",
            "priority": "low",
            "user_id": str(sample_user.id)
        },
        {
            "title": "Zulu Task",
            "description": "Last alphabetically",
            "status": "pending",
            "priority": "high",
            "user_id": str(sample_user.id)
        },
        {
            "title": "Bravo Task",
            "description": "Middle alphabetically",
            "status": "pending",
            "priority": "medium",
            "user_id": str(sample_user.id)
        }
    ]
    
    # Create tasks via API
    for task_data in tasks_data:
        response = client.post("/api/tasks/", json=task_data)
        assert response.status_code == 200
    
    # Test sorting by title (ascending)
    response = client.get(f"/api/tasks/?user_id={sample_user.id}&sort_by=title&sort_order=asc")
    assert response.status_code == 200
    sorted_tasks = response.json()
    assert len(sorted_tasks) == 3
    assert sorted_tasks[0]["title"] == "Alpha Task"
    assert sorted_tasks[-1]["title"] == "Zulu Task"
    
    # Test sorting by priority (descending)
    response = client.get(f"/api/tasks/?user_id={sample_user.id}&sort_by=priority&sort_order=desc")
    assert response.status_code == 200
    sorted_tasks = response.json()
    assert len(sorted_tasks) == 3
    # High priority should come first when sorting descending
    assert sorted_tasks[0]["priority"] == "high"