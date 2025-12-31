import time
import pytest
from storage.in_memory_storage import InMemoryStorage


class TestPerformance:
    """Performance tests to validate O(1) operations and response time targets."""
    
    def setup_method(self):
        """Set up a fresh storage for each test."""
        self.storage = InMemoryStorage()
    
    def test_add_task_performance(self):
        """Test that adding tasks performs within time limits."""
        start_time = time.time()
        
        # Add 100 tasks
        for i in range(100):
            self.storage.add_task(f"Task {i}", f"Description {i}")
        
        end_time = time.time()
        duration = (end_time - start_time) * 1000  # Convert to milliseconds
        
        # All 100 tasks should be added in under 100ms (average < 1ms per task)
        assert duration < 100, f"Adding 100 tasks took {duration:.2f}ms, expected < 100ms"
    
    def test_get_task_performance(self):
        """Test that getting a task performs within time limits."""
        # Add 1000 tasks to have a large dataset
        task_ids = []
        for i in range(1000):
            task = self.storage.add_task(f"Task {i}", f"Description {i}")
            task_ids.append(task.id)
        
        # Measure time to get a task by ID (should be O(1) with dict lookup)
        start_time = time.time()
        
        # Get the middle task ID
        target_id = task_ids[500]
        task = self.storage.get_task(target_id)
        
        end_time = time.time()
        duration = (end_time - start_time) * 1000  # Convert to milliseconds
        
        # Getting a task should be under 1ms
        assert duration < 1, f"Getting a task took {duration:.2f}ms, expected < 1ms"
        assert task.id == target_id
    
    def test_get_all_tasks_performance(self):
        """Test that getting all tasks performs within time limits."""
        # Add 1000 tasks
        for i in range(1000):
            self.storage.add_task(f"Task {i}", f"Description {i}")
        
        start_time = time.time()
        
        tasks = self.storage.get_all_tasks()
        
        end_time = time.time()
        duration = (end_time - start_time) * 1000  # Convert to milliseconds
        
        # Getting all 1000 tasks should be under 10ms
        assert duration < 10, f"Getting all 1000 tasks took {duration:.2f}ms, expected < 10ms"
        assert len(tasks) == 1000
    
    def test_update_task_performance(self):
        """Test that updating a task performs within time limits."""
        # Add 1000 tasks
        task_ids = []
        for i in range(1000):
            task = self.storage.add_task(f"Task {i}", f"Description {i}")
            task_ids.append(task.id)
        
        # Measure time to update a task (should be O(1) with dict lookup)
        start_time = time.time()
        
        # Update the middle task
        target_id = task_ids[500]
        self.storage.update_task(target_id, title="Updated Title")
        
        end_time = time.time()
        duration = (end_time - start_time) * 1000  # Convert to milliseconds
        
        # Updating a task should be under 1ms
        assert duration < 1, f"Updating a task took {duration:.2f}ms, expected < 1ms"
        
        # Verify the update
        updated_task = self.storage.get_task(target_id)
        assert updated_task.title == "Updated Title"
    
    def test_delete_task_performance(self):
        """Test that deleting a task performs within time limits."""
        # Add 1000 tasks
        task_ids = []
        for i in range(1000):
            task = self.storage.add_task(f"Task {i}", f"Description {i}")
            task_ids.append(task.id)
        
        # Measure time to delete a task (should be O(1) with dict lookup)
        start_time = time.time()
        
        # Delete the middle task
        target_id = task_ids[500]
        self.storage.delete_task(target_id)
        
        end_time = time.time()
        duration = (end_time - start_time) * 1000  # Convert to milliseconds
        
        # Deleting a task should be under 1ms
        assert duration < 1, f"Deleting a task took {duration:.2f}ms, expected < 1ms"
        
        # Verify the deletion
        assert target_id not in self.storage.tasks
        assert len(self.storage.tasks) == 999
    
    def test_operation_response_time_within_100ms(self):
        """Test that all operations complete within 100ms as specified in the requirements."""
        # Add a task
        start_time = time.time()
        task = self.storage.add_task("Performance Test Task", "Performance Test Description")
        add_duration = (time.time() - start_time) * 1000
        
        # Get the task
        start_time = time.time()
        retrieved_task = self.storage.get_task(task.id)
        get_duration = (time.time() - start_time) * 1000
        
        # Update the task
        start_time = time.time()
        self.storage.update_task(task.id, title="Updated Performance Test Task")
        update_duration = (time.time() - start_time) * 1000
        
        # Mark complete
        start_time = time.time()
        self.storage.mark_task_complete(task.id)
        mark_complete_duration = (time.time() - start_time) * 1000
        
        # Delete the task
        start_time = time.time()
        self.storage.delete_task(task.id)
        delete_duration = (time.time() - start_time) * 1000
        
        # All operations should complete within 100ms
        assert add_duration < 100, f"Add operation took {add_duration:.2f}ms, expected < 100ms"
        assert get_duration < 100, f"Get operation took {get_duration:.2f}ms, expected < 100ms"
        assert update_duration < 100, f"Update operation took {update_duration:.2f}ms, expected < 100ms"
        assert mark_complete_duration < 100, f"Mark complete operation took {mark_complete_duration:.2f}ms, expected < 100ms"
        assert delete_duration < 100, f"Delete operation took {delete_duration:.2f}ms, expected < 100ms"