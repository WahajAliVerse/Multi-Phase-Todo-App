import pytest
import time
import asyncio
from sqlmodel import Session
from backend.src.models.task import Task
from backend.src.services.task_service import TaskService
from backend.src.repositories.task_repository import TaskRepository
from uuid import uuid4
import random
import string


def generate_random_string(length: int) -> str:
    """Helper function to generate random strings for testing"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


@pytest.fixture
def performance_test_setup(session: Session):
    """Setup for performance tests with multiple tasks"""
    task_service = TaskService()
    user_id = uuid4()
    
    # Create a user for the test
    user = User(
        id=user_id,
        email=f"{generate_random_string(10)}@example.com",
        hashed_password="test_password_hash",
        first_name="Performance",
        last_name="Test"
    )
    session.add(user)
    session.commit()
    
    # Create 1000 tasks for performance testing
    tasks = []
    for i in range(1000):
        task = Task(
            id=uuid4(),
            title=f"Performance Test Task {i}",
            description=f"This is a test task for performance evaluation #{i}",
            status=random.choice(["pending", "in_progress", "completed"]),
            priority=random.choice(["low", "medium", "high"]),
            user_id=user_id
        )
        tasks.append(task)
        session.add(task)
    
    session.commit()
    
    yield {
        "user_id": user_id,
        "task_service": task_service,
        "session": session,
        "tasks": tasks
    }
    
    # Cleanup: Remove created tasks and user
    for task in tasks:
        session.delete(task)
    session.delete(user)
    session.commit()


def test_performance_load_1000_tasks(performance_test_setup):
    """Test performance when loading 1000 tasks"""
    setup_data = performance_test_setup
    session = setup_data["session"]
    user_id = setup_data["user_id"]
    task_service = setup_data["task_service"]
    
    # Measure time to get all tasks for user
    start_time = time.time()
    tasks = task_service.get_tasks_by_user(
        session=session,
        user_id=user_id,
        skip=0,
        limit=1000
    )
    end_time = time.time()
    
    elapsed_time = end_time - start_time
    
    # Performance requirement: Should load 1000 tasks in under 1 second
    assert elapsed_time < 1.0, f"Loading 1000 tasks took {elapsed_time:.2f}s, which exceeds 1s limit"
    assert len(tasks) == 1000, f"Expected 1000 tasks, got {len(tasks)}"
    
    print(f"Loaded 1000 tasks in {elapsed_time:.2f} seconds")


def test_performance_create_multiple_tasks(performance_test_setup):
    """Test performance when creating multiple tasks"""
    setup_data = performance_test_setup
    session = setup_data["session"]
    user_id = setup_data["user_id"]
    task_service = setup_data["task_service"]
    
    # Create 100 new tasks and measure performance
    start_time = time.time()
    
    created_tasks = []
    for i in range(100):
        task_data = TaskCreate(
            title=f"Batch Task {i}",
            description=f"Description for batch task {i}",
            status="pending",
            priority="medium",
            user_id=user_id
        )
        created_task = task_service.create_task(session, task_data)
        created_tasks.append(created_task)
    
    end_time = time.time()
    
    elapsed_time = end_time - start_time
    
    # Performance requirement: Should create 100 tasks in under 5 seconds
    assert elapsed_time < 5.0, f"Creating 100 tasks took {elapsed_time:.2f}s, which exceeds 5s limit"
    assert len(created_tasks) == 100, f"Expected 100 tasks to be created, got {len(created_tasks)}"
    
    # Clean up created tasks
    for task in created_tasks:
        session.delete(task)
    session.commit()
    
    print(f"Created 100 tasks in {elapsed_time:.2f} seconds")


def test_performance_search_functionality(performance_test_setup):
    """Test performance of search functionality with large dataset"""
    setup_data = performance_test_setup
    session = setup_data["session"]
    user_id = setup_data["user_id"]
    task_service = setup_data["task_service"]
    
    # Measure time to search tasks
    start_time = time.time()
    search_results = task_service.get_tasks_by_user(
        session=session,
        user_id=user_id,
        search="Performance Test Task",
        skip=0,
        limit=100
    )
    end_time = time.time()
    
    elapsed_time = end_time - start_time
    
    # Performance requirement: Should search through 1000 tasks in under 0.5 seconds
    assert elapsed_time < 0.5, f"Searching tasks took {elapsed_time:.2f}s, which exceeds 0.5s limit"
    assert len(search_results) > 0, "Search should return at least one result"
    
    print(f"Searched tasks in {elapsed_time:.2f} seconds, found {len(search_results)} results")


def test_performance_filter_by_priority(performance_test_setup):
    """Test performance of filtering tasks by priority"""
    setup_data = performance_test_setup
    session = setup_data["session"]
    user_id = setup_data["user_id"]
    task_service = setup_data["task_service"]
    
    # Measure time to filter tasks by priority
    start_time = time.time()
    high_priority_tasks = task_service.get_tasks_by_user(
        session=session,
        user_id=user_id,
        priority="high",
        skip=0,
        limit=1000
    )
    end_time = time.time()
    
    elapsed_time = end_time - start_time
    
    # Performance requirement: Should filter 1000 tasks in under 0.5 seconds
    assert elapsed_time < 0.5, f"Filtering tasks by priority took {elapsed_time:.2f}s, which exceeds 0.5s limit"
    
    print(f"Filtered high priority tasks in {elapsed_time:.2f} seconds, found {len(high_priority_tasks)} results")


def test_performance_sort_by_date(performance_test_setup):
    """Test performance of sorting tasks by date"""
    setup_data = performance_test_setup
    session = setup_data["session"]
    user_id = setup_data["user_id"]
    task_service = setup_data["task_service"]
    
    # Measure time to sort tasks by creation date
    start_time = time.time()
    sorted_tasks = task_service.get_tasks_by_user(
        session=session,
        user_id=user_id,
        sort_by="created_at",
        sort_order="desc",
        skip=0,
        limit=1000
    )
    end_time = time.time()
    
    elapsed_time = end_time - start_time
    
    # Performance requirement: Should sort 1000 tasks in under 0.5 seconds
    assert elapsed_time < 0.5, f"Sorting tasks by date took {elapsed_time:.2f}s, which exceeds 0.5s limit"
    assert len(sorted_tasks) == 1000, f"Expected 1000 tasks, got {len(sorted_tasks)}"
    
    # Verify tasks are actually sorted by date (newest first)
    for i in range(len(sorted_tasks) - 1):
        assert sorted_tasks[i].created_at >= sorted_tasks[i+1].created_at, \
            "Tasks are not properly sorted by creation date"
    
    print(f"Sorted tasks by date in {elapsed_time:.2f} seconds")


def test_concurrent_access_performance(performance_test_setup):
    """Test performance under concurrent access"""
    setup_data = performance_test_setup
    session = setup_data["session"]
    user_id = setup_data["user_id"]
    task_service = setup_data["task_service"]
    
    async def get_tasks_async():
        """Async function to simulate concurrent access"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            task_service.get_tasks_by_user,
            session,
            user_id,
            0,
            50
        )
    
    # Simulate 10 concurrent requests
    start_time = time.time()
    concurrent_tasks = [get_tasks_async() for _ in range(10)]
    results = asyncio.run(asyncio.gather(*concurrent_tasks))
    end_time = time.time()
    
    elapsed_time = end_time - start_time
    
    # Performance requirement: Should handle 10 concurrent requests in under 2 seconds
    assert elapsed_time < 2.0, f"Handling 10 concurrent requests took {elapsed_time:.2f}s, which exceeds 2s limit"
    assert len(results) == 10, f"Expected 10 results, got {len(results)}"
    
    print(f"Handled 10 concurrent requests in {elapsed_time:.2f} seconds")


class TestPerformanceOptimization:
    """Additional performance tests focusing on optimization techniques"""
    
    def test_database_indexing_impact(self, performance_test_setup):
        """Test the impact of database indexing on performance"""
        setup_data = performance_test_setup
        session = setup_data["session"]
        user_id = setup_data["user_id"]
        task_service = setup_data["task_service"]
        
        # Test performance of filtering by user_id (should be indexed)
        start_time = time.time()
        user_tasks = task_service.get_tasks_by_user(
            session=session,
            user_id=user_id,
            skip=0,
            limit=1000
        )
        end_time = time.time()
        
        user_filter_time = end_time - start_time
        assert len(user_tasks) == 1000, "Should retrieve all tasks for user"
        
        # Test performance of searching by title (should be optimized with proper indexing)
        start_time = time.time()
        search_results = task_service.get_tasks_by_user(
            session=session,
            user_id=user_id,
            search="Performance Test Task 1",
            skip=0,
            limit=100
        )
        end_time = time.time()
        
        search_time = end_time - start_time
        
        # Both operations should be reasonably fast with proper indexing
        assert user_filter_time < 1.0, f"User filtering took too long: {user_filter_time:.2f}s"
        assert search_time < 1.0, f"Title search took too long: {search_time:.2f}s"
        
        print(f"User filtering: {user_filter_time:.2f}s, Title search: {search_time:.2f}s")
    
    def test_pagination_performance(self, performance_test_setup):
        """Test performance of pagination with large datasets"""
        setup_data = performance_test_setup
        session = setup_data["session"]
        user_id = setup_data["user_id"]
        task_service = setup_data["task_service"]
        
        # Test performance of different pagination offsets
        offsets_to_test = [0, 250, 500, 750]
        
        for offset in offsets_to_test:
            start_time = time.time()
            paginated_tasks = task_service.get_tasks_by_user(
                session=session,
                user_id=user_id,
                skip=offset,
                limit=50
            )
            end_time = time.time()
            
            elapsed_time = end_time - start_time
            
            # Performance requirement: Each pagination request should be under 0.5 seconds
            assert elapsed_time < 0.5, f"Pagination at offset {offset} took {elapsed_time:.2f}s, which exceeds 0.5s limit"
            assert len(paginated_tasks) == 50, f"Expected 50 tasks at offset {offset}, got {len(paginated_tasks)}"
            
            print(f"Pagination at offset {offset}: {elapsed_time:.2f}s")