from storage.in_memory_storage import InMemoryStorage
from models.task import Task
from exceptions import InvalidTaskError
import sys


class ConsoleUI:
    def __init__(self, storage: InMemoryStorage):
        """Initialize console UI with storage"""
        self.storage = storage

    def display_menu(self) -> None:
        """Display the main menu options"""
        print("\n--- Todo Application ---")
        print("1. Add Task")
        print("2. View Tasks")
        print("3. Update Task")
        print("4. Delete Task")
        print("5. Mark Complete")
        print("6. Mark Incomplete")
        print("7. Exit")
        print("------------------------")

    def handle_add_task(self) -> None:
        """Handle adding a new task"""
        try:
            title = input("Enter task title: ").strip()
            
            # Validate title is not empty
            if not title:
                print("Error: Task title cannot be empty.")
                return
            
            description = input("Enter task description (optional): ").strip()
            
            task = self.storage.add_task(title, description)
            print(f"Task added successfully with ID: {task.id}")
        except InvalidTaskError as e:
            print(f"Error: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

    def handle_view_tasks(self) -> None:
        """Handle viewing all tasks"""
        try:
            tasks = self.storage.get_all_tasks()
            
            if not tasks:
                print("No tasks found.")
                return
            
            print("\n--- Task List ---")
            for task in tasks:
                status = "✓" if task.completed else "○"
                description = task.description if task.description else "(No description)"
                print(f"[{task.id}] {task.title} - {description} [{status}]")
        except Exception as e:
            print(f"An error occurred while retrieving tasks: {e}")

    def handle_update_task(self) -> None:
        """Handle updating a task"""
        try:
            task_id_input = input("Enter task ID to update: ").strip()
            
            if not task_id_input:
                print("Error: Task ID cannot be empty.")
                return
            
            try:
                task_id = int(task_id_input)
            except ValueError:
                print("Error: Task ID must be a number.")
                return
            
            # Get current task to show current values
            try:
                current_task = self.storage.get_task(task_id)
                print(f"Current title: {current_task.title}")
                print(f"Current description: {current_task.description}")
            except Exception:
                print(f"Error: Task with ID {task_id} not found.")
                return
            
            new_title = input("Enter new title (press Enter to keep current): ").strip()
            new_description = input("Enter new description (press Enter to keep current): ").strip()
            
            # Use None if user pressed Enter without typing anything, to keep current values
            title_update = new_title if new_title else None
            description_update = new_description if new_description else None
            
            self.storage.update_task(task_id, title_update, description_update)
            print("Task updated successfully.")
        except InvalidTaskError as e:
            print(f"Error: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

    def handle_delete_task(self) -> None:
        """Handle deleting a task"""
        try:
            task_id_input = input("Enter task ID to delete: ").strip()
            
            if not task_id_input:
                print("Error: Task ID cannot be empty.")
                return
            
            try:
                task_id = int(task_id_input)
            except ValueError:
                print("Error: Task ID must be a number.")
                return
            
            confirmation = input(f"Are you sure you want to delete task {task_id}? (y/N): ").strip().lower()
            
            if confirmation in ['y', 'yes']:
                self.storage.delete_task(task_id)
                print("Task deleted successfully.")
            else:
                print("Deletion cancelled.")
        except Exception as e:
            print(f"An error occurred while deleting task: {e}")

    def handle_mark_complete(self) -> None:
        """Handle marking a task as complete"""
        try:
            task_id_input = input("Enter task ID to mark complete: ").strip()
            
            if not task_id_input:
                print("Error: Task ID cannot be empty.")
                return
            
            try:
                task_id = int(task_id_input)
            except ValueError:
                print("Error: Task ID must be a number.")
                return
            
            self.storage.mark_task_complete(task_id)
            print("Task marked as complete.")
        except Exception as e:
            print(f"An error occurred: {e}")

    def handle_mark_incomplete(self) -> None:
        """Handle marking a task as incomplete"""
        try:
            task_id_input = input("Enter task ID to mark incomplete: ").strip()
            
            if not task_id_input:
                print("Error: Task ID cannot be empty.")
                return
            
            try:
                task_id = int(task_id_input)
            except ValueError:
                print("Error: Task ID must be a number.")
                return
            
            self.storage.mark_task_incomplete(task_id)
            print("Task marked as incomplete.")
        except Exception as e:
            print(f"An error occurred: {e}")

    def run(self) -> None:
        """Run the main application loop"""
        while True:
            self.display_menu()
            choice = input("Select an option: ").strip()
            
            if choice == "1":
                self.handle_add_task()
            elif choice == "2":
                self.handle_view_tasks()
            elif choice == "3":
                self.handle_update_task()
            elif choice == "4":
                self.handle_delete_task()
            elif choice == "5":
                self.handle_mark_complete()
            elif choice == "6":
                self.handle_mark_incomplete()
            elif choice == "7":
                print("Goodbye!")
                sys.exit(0)
            else:
                print("Invalid option. Please try again.")