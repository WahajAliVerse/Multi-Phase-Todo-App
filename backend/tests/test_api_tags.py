import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from src.database.database import Base, get_db
from src.models.tag import Tag

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

class TestTagAPI:
    """Integration tests for tag API endpoints."""

    def test_create_tag(self):
        """Test creating a new tag."""
        tag_data = {
            "name": "Test Tag",
            "color": "#FF0000"
        }

        response = client.post("/tags/", json=tag_data)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Tag created successfully"
        assert "data" in data
        assert data["data"]["name"] == tag_data["name"]
        assert data["data"]["color"] == tag_data["color"]

    def test_create_tag_missing_name(self):
        """Test creating a tag without a name should fail."""
        tag_data = {
            "color": "#FF0000"
        }

        response = client.post("/tags/", json=tag_data)
        assert response.status_code == 422  # Validation error

    def test_create_tag_invalid_name_length(self):
        """Test creating a tag with an invalid name length should fail."""
        tag_data = {
            "name": "",  # Too short
            "color": "#FF0000"
        }

        response = client.post("/tags/", json=tag_data)
        assert response.status_code == 400  # Validation error

        tag_data = {
            "name": "a" * 51,  # Too long
            "color": "#FF0000"
        }

        response = client.post("/tags/", json=tag_data)
        assert response.status_code == 400  # Validation error

    def test_get_tags(self):
        """Test retrieving a list of tags."""
        # First create a tag
        tag_data = {
            "name": "Test Tag for Listing",
            "color": "#00FF00"
        }
        create_response = client.post("/tags/", json=tag_data)
        assert create_response.status_code == 200

        # Then retrieve the list
        response = client.get("/tags/")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert len(data["data"]) >= 1

    def test_get_tag_by_id(self):
        """Test retrieving a specific tag by ID."""
        # First create a tag
        tag_data = {
            "name": "Test Tag for Retrieval",
            "color": "#0000FF"
        }
        create_response = client.post("/tags/", json=tag_data)
        assert create_response.status_code == 200
        created_tag = create_response.json()["data"]
        tag_id = created_tag["id"]

        # Then retrieve it by ID
        # Note: Since we don't have a specific endpoint for getting a single tag by ID,
        # we'll just verify that the tag exists in the list
        response = client.get("/tags/")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        tag_found = any(tag["id"] == tag_id for tag in data["data"])
        assert tag_found

    def test_update_tag(self):
        """Test updating an existing tag."""
        # First create a tag
        tag_data = {
            "name": "Original Tag",
            "color": "#FF0000"
        }
        create_response = client.post("/tags/", json=tag_data)
        assert create_response.status_code == 200
        created_tag = create_response.json()["data"]
        tag_id = created_tag["id"]

        # Then update it
        update_data = {
            "name": "Updated Tag",
            "color": "#00FF00"
        }
        response = client.put(f"/tags/{tag_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert data["data"]["name"] == update_data["name"]
        assert data["data"]["color"] == update_data["color"]

    def test_delete_tag(self):
        """Test deleting an existing tag."""
        # First create a tag
        tag_data = {
            "name": "Tag to Delete",
            "color": "#0000FF"
        }
        create_response = client.post("/tags/", json=tag_data)
        assert create_response.status_code == 200
        created_tag = create_response.json()["data"]
        tag_id = created_tag["id"]

        # Then delete it
        response = client.delete(f"/tags/{tag_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Tag deleted successfully"

        # Verify it's gone
        get_response = client.get("/tags/")
        assert get_response.status_code == 200
        data = get_response.json()
        tag_found = any(tag["id"] == tag_id for tag in data["data"])
        assert not tag_found