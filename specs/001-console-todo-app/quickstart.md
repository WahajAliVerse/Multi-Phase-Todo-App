# Quickstart Guide: Console Todo Application

## Prerequisites

- Python 3.12 or higher
- No external dependencies required

## Installation

1. Clone or download the repository
2. Navigate to the project directory
3. The application is ready to run (no installation required)

## Running the Application

```bash
cd src/cli
python console_ui.py
```

## Using the Application

### Main Menu Options

When the application starts, you'll see the main menu with the following options:

1. **Add Task**: Create a new task with a title and optional description
2. **View Tasks**: Display all tasks with their IDs, titles, descriptions, and completion status
3. **Update Task**: Modify the title or description of an existing task
4. **Delete Task**: Remove a task by its ID
5. **Mark Complete**: Mark a task as completed
6. **Mark Incomplete**: Mark a completed task as incomplete
7. **Exit**: Quit the application

### Adding a Task

1. Select option 1 from the main menu
2. Enter the task title when prompted
3. Optionally enter a task description when prompted
4. The task will be added with a unique ID

### Viewing Tasks

1. Select option 2 from the main menu
2. All tasks will be displayed in the format: `[ID] Title - [Description] [Status]`
3. Completed tasks will show a checkmark (✓) and incomplete tasks will show a circle (○)

### Updating a Task

1. Select option 3 from the main menu
2. Enter the ID of the task you want to update
3. Enter the new title (or press Enter to keep the current title)
4. Enter the new description (or press Enter to keep the current description)

### Deleting a Task

1. Select option 4 from the main menu
2. Enter the ID of the task you want to delete
3. Confirm the deletion when prompted

### Marking a Task Complete/Incomplete

1. Select option 5 (Mark Complete) or 6 (Mark Incomplete) from the main menu
2. Enter the ID of the task you want to update
3. The task status will be updated accordingly

## Error Handling

- If you enter an invalid task ID, an error message will be displayed
- If you try to perform operations on an empty task list, an appropriate message will be shown
- All inputs are validated to prevent application crashes

## Data Persistence

- All tasks are stored in-memory only
- Data will be lost when the application exits
- This is intentional for Phase I of the multi-phase todo application

## Testing

To run the tests:

```bash
cd project_root
python -m pytest tests/
```

## Architecture Overview

The application follows a modular design with three main components:

1. **Models**: Contains the Task data class
2. **Storage**: Handles in-memory storage operations
3. **CLI**: Manages user interface and input/output