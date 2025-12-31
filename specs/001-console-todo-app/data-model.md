# Data Model: Console Todo Application

## Task Entity

### Attributes
- **id**: Integer (auto-incrementing, unique identifier)
- **title**: String (required, non-empty)
- **description**: String (optional, can be empty)
- **completed**: Boolean (default: False)

### Validation Rules
- ID must be a positive integer
- Title must be a non-empty string (1-255 characters)
- Description can be empty but limited to 1000 characters if provided
- Completed status must be a boolean value

### State Transitions
- New task: `completed = False`
- Mark complete: `completed = True`
- Mark incomplete: `completed = False`

## Task List Entity

### Attributes
- **tasks**: List/Dictionary of Task entities
- **next_id**: Integer (for auto-incrementing ID generation)

### Operations
- Add task: Insert new Task entity with auto-generated ID
- Get task by ID: Retrieve Task entity by its ID
- Update task: Modify existing Task entity attributes
- Delete task: Remove Task entity by its ID
- List all tasks: Return all Task entities
- Mark complete: Update Task entity's completed status

### Validation Rules
- No duplicate IDs allowed
- Task with non-existent ID cannot be retrieved/updated/deleted
- Maximum 1000 tasks allowed in memory