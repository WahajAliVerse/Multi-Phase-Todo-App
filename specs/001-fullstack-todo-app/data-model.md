# Data Model: Full-Stack Web Application (Phase II)

## Entities

### Task
Represents a user's task with all associated properties.

**Fields:**
- `id` (UUID/Integer): Unique identifier for the task
- `title` (String, 1-255 chars): Title of the task
- `description` (Text, optional): Detailed description of the task
- `status` (Enum: 'active', 'completed'): Current status of the task
- `priority` (Enum: 'high', 'medium', 'low'): Priority level of the task
- `due_date` (DateTime, optional): Date and time when the task is due
- `created_at` (DateTime): Timestamp when the task was created
- `updated_at` (DateTime): Timestamp when the task was last updated
- `completed_at` (DateTime, optional): Timestamp when the task was completed
- `user_id` (UUID/Integer): Foreign key linking to the user who owns the task
- `recurrence_pattern_id` (UUID/Integer, optional): Foreign key linking to recurrence pattern if recurring

**Relationships:**
- Belongs to one User (many-to-one)
- Has many Tags through task_tags junction table (many-to-many)
- Has one RecurrencePattern (optional, many-to-one)

**Validation Rules:**
- Title must be 1-255 characters
- Status must be one of 'active' or 'completed'
- Priority must be one of 'high', 'medium', or 'low'
- Due date must be in the future if provided
- Cannot be completed before creation date

**State Transitions:**
- `active` → `completed` (when user marks task as complete)
- `completed` → `active` (when user reopens task)

### User
Represents an authenticated user of the system.

**Fields:**
- `id` (UUID/Integer): Unique identifier for the user
- `username` (String, unique): Username for login
- `email` (String, unique): Email address of the user
- `password_hash` (String): Hashed password for authentication
- `created_at` (DateTime): Timestamp when the user account was created
- `updated_at` (DateTime): Timestamp when the user account was last updated
- `is_active` (Boolean): Whether the user account is active
- `preferences` (JSON, optional): User preferences including theme settings

**Relationships:**
- Has many Tasks (one-to-many)
- Has many Tags (one-to-many)

**Validation Rules:**
- Username must be unique and 3-50 characters
- Email must be valid and unique
- Password must meet complexity requirements
- Preferences must be valid JSON

### Tag
Represents a label that can be applied to tasks for organization.

**Fields:**
- `id` (UUID/Integer): Unique identifier for the tag
- `name` (String, 1-50 chars): Name of the tag
- `color` (String, optional): Color code for visual identification
- `user_id` (UUID/Integer): Foreign key linking to the user who owns the tag
- `created_at` (DateTime): Timestamp when the tag was created

**Relationships:**
- Belongs to one User (many-to-one)
- Connected to many Tasks through task_tags junction table (many-to-many)

**Validation Rules:**
- Name must be 1-50 characters
- Name must be unique per user
- Color must be a valid hex color code if provided

### RecurrencePattern
Defines how a task repeats over time.

**Fields:**
- `id` (UUID/Integer): Unique identifier for the pattern
- `pattern_type` (Enum: 'daily', 'weekly', 'monthly', 'yearly'): Type of recurrence
- `interval` (Integer): Interval multiplier (e.g., every 2 weeks)
- `end_condition` (Enum: 'never', 'after', 'on_date'): When recurrence ends
- `occurrences_count` (Integer, optional): Number of occurrences if end_condition is 'after'
- `end_date` (Date, optional): End date if end_condition is 'on_date'
- `created_at` (DateTime): Timestamp when the pattern was created
- `updated_at` (DateTime): Timestamp when the pattern was last updated

**Relationships:**
- Connected to many Tasks (one-to-many)

**Validation Rules:**
- Pattern type must be one of the allowed values
- Interval must be a positive integer
- If end_condition is 'after', occurrences_count must be provided and positive
- If end_condition is 'on_date', end_date must be provided and in the future

## Relationships

### Task ↔ Tag (Many-to-Many)
Tasks can have multiple tags, and tags can be applied to multiple tasks.
- Implemented through a junction table `task_tags`
- Fields in junction table: task_id, tag_id, created_at

### Task ↔ User (Many-to-One)
Each task belongs to one user.
- Foreign key: user_id in the tasks table

### Tag ↔ User (Many-to-One)
Each tag belongs to one user.
- Foreign key: user_id in the tags table

### Task ↔ RecurrencePattern (Many-to-One)
A task can have one recurrence pattern (optional).
- Foreign key: recurrence_pattern_id in the tasks table

## Indexes

### Tasks Table
- Index on `user_id` (for user-specific queries)
- Index on `status` (for filtering by status)
- Index on `priority` (for sorting by priority)
- Index on `due_date` (for due date queries)
- Composite index on (`user_id`, `status`) (for user-specific status queries)
- Index on `created_at` (for chronological ordering)

### Tags Table
- Index on `user_id` (for user-specific queries)
- Index on `name` (for tag name searches)
- Composite index on (`user_id`, `name`) (for user-specific tag queries)

### Task_Tags Junction Table
- Index on `task_id` (for task-specific tag queries)
- Index on `tag_id` (for tag-specific task queries)

## Constraints

### Referential Integrity
- Foreign key constraints ensure referential integrity between related tables
- Cascade delete for user deletion (deletes user's tasks and tags)
- Restrict deletion of tags that are still assigned to tasks

### Business Logic
- A task cannot be completed before its creation date
- Due dates must be in the future when set
- Recurring tasks generate new instances based on their recurrence pattern
- Users cannot have duplicate tag names