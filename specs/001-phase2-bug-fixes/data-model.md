# Data Model for Phase 2 Todo Application

## Overview
This document defines the data models for the Phase 2 Todo Application, incorporating all bug fixes and enhancements while preserving Phase 1 functionality.

## Entity Models

### User
Represents a person using the application, with authentication credentials, preferences, and associated tasks.

**Fields:**
- `id` (Integer, Primary Key): Unique identifier for the user
- `username` (String, 50): Unique username for login
- `email` (String, 100): Unique email address
- `hashed_password` (String, 255): Hashed password using bcrypt
- `is_active` (Boolean): Whether the account is active
- `preferences` (Text): JSON string for user preferences (theme, language, etc.)
- `created_at` (DateTime): Account creation timestamp
- `updated_at` (DateTime): Last update timestamp
- `version` (Integer): For optimistic locking

**Relationships:**
- One-to-Many with Task (user.tasks)
- One-to-Many with Tag (user.tags)

**Validation:**
- Username must be unique and 3-50 characters
- Email must be valid and unique
- Password must meet security requirements

### Task
Represents a todo item with title, description, priority, due date, status, recurrence pattern, and associated tags.

**Fields:**
- `id` (Integer, Primary Key): Unique identifier for the task
- `title` (String, 255): Task title (required)
- `description` (Text): Detailed description of the task
- `status` (Enum: active, completed): Current status of the task
- `priority` (Enum: low, medium, high): Priority level of the task
- `due_date` (DateTime): Deadline for the task (nullable)
- `completed_at` (DateTime): Timestamp when task was completed (nullable)
- `recurrence_pattern` (String): Cron-like pattern for recurring tasks (nullable)
- `parent_task_id` (Integer, Foreign Key): Reference to parent task for subtasks (nullable)
- `user_id` (Integer, Foreign Key): Owner of the task (required)
- `created_at` (DateTime): Task creation timestamp
- `updated_at` (DateTime): Last update timestamp
- `version` (Integer): For optimistic locking

**Relationships:**
- Many-to-One with User (task.user)
- Many-to-Many with Tag through TaskTag (task.tags)
- One-to-Many with RecurrencePattern (task.recurrence_pattern_rel)
- Self-referencing for parent/child tasks (task.parent_task, task.child_tasks)

**Validation:**
- Title is required and must be 1-255 characters
- Priority must be one of the allowed values
- Due date must be a future date if provided
- Status must be one of the allowed values

### Tag
Represents a category or label that can be applied to tasks for organization and filtering.

**Fields:**
- `id` (Integer, Primary Key): Unique identifier for the tag
- `name` (String, 50): Tag name (required)
- `color` (String, 7): Hex color code for visual identification (default: #007bff)
- `user_id` (Integer, Foreign Key): Owner of the tag (required)
- `created_at` (DateTime): Tag creation timestamp
- `updated_at` (DateTime): Last update timestamp
- `version` (Integer): For optimistic locking

**Relationships:**
- Many-to-One with User (tag.user)
- Many-to-Many with Task through TaskTag (tag.tasks)

**Validation:**
- Name is required and must be 1-50 characters
- Color must be a valid hex color code

### TaskTag (Association Table)
Intermediate table for the many-to-many relationship between Task and Tag.

**Fields:**
- `task_id` (Integer, Foreign Key): Reference to the task
- `tag_id` (Integer, Foreign Key): Reference to the tag

**Constraints:**
- Composite primary key of (task_id, tag_id)
- Foreign key constraints to both Task and Tag tables

### Session
Represents an authenticated user session with JWT token and associated permissions.

**Fields:**
- `id` (Integer, Primary Key): Unique identifier for the session
- `user_id` (Integer, Foreign Key): Reference to the user
- `token_hash` (String, 255): Hash of the JWT token
- `expires_at` (DateTime): Expiration timestamp
- `created_at` (DateTime): Session creation timestamp
- `last_accessed` (DateTime): Last access timestamp
- `device_info` (Text): Information about the device used
- `ip_address` (String): IP address of the session

**Relationships:**
- Many-to-One with User (session.user)

**Validation:**
- Token hash is required
- Expires_at must be in the future

### Reminder
Represents a scheduled notification for a task with timing and delivery status.

**Fields:**
- `id` (Integer, Primary Key): Unique identifier for the reminder
- `task_id` (Integer, Foreign Key): Reference to the task
- `scheduled_time` (DateTime): When the reminder should be triggered
- `delivery_status` (Enum: pending, sent, missed): Status of the reminder
- `notification_type` (Enum: email, push, in_app): Method of delivery
- `created_at` (DateTime): Reminder creation timestamp
- `updated_at` (DateTime): Last update timestamp

**Relationships:**
- Many-to-One with Task (reminder.task)

**Validation:**
- Scheduled time must be in the future
- Delivery status must be one of the allowed values

### RecurrencePattern
Defines how a task repeats over time (daily, weekly, monthly, etc.).

**Fields:**
- `id` (Integer, Primary Key): Unique identifier for the pattern
- `pattern_type` (Enum: daily, weekly, monthly, yearly): Type of recurrence
- `interval` (Integer): How often the pattern repeats (e.g., every 2 weeks)
- `end_condition` (Enum: never, after_date, after_occurrences): When to stop recurrence
- `end_date` (DateTime): Date when recurrence stops (nullable)
- `max_occurrences` (Integer): Max number of occurrences (nullable)
- `created_at` (DateTime): Pattern creation timestamp
- `updated_at` (DateTime): Last update timestamp
- `version` (Integer): For optimistic locking

**Relationships:**
- One-to-One with Task (pattern.task)

**Validation:**
- Pattern type must be one of the allowed values
- Interval must be positive
- End condition must be valid with corresponding fields

## State Transitions

### Task Status Transitions
- `active` → `completed`: When user marks task as complete
- `completed` → `active`: When user reopens a completed task
- On completion: `completed_at` is set to current timestamp
- On reopening: `completed_at` is set to null

### Recurrence Handling
- When a recurring task is completed, the next occurrence is automatically scheduled based on the recurrence pattern
- The new task inherits properties from the original task but has a new due date
- Original task is archived or marked as historical depending on user preference

## Indexes for Performance
- User: indexes on `username`, `email`
- Task: indexes on `user_id`, `status`, `priority`, `due_date`, `created_at`
- Tag: indexes on `user_id`, `name`
- TaskTag: indexes on `task_id`, `tag_id`
- Session: indexes on `user_id`, `expires_at`
- Reminder: indexes on `task_id`, `scheduled_time`, `delivery_status`

## Data Integrity Constraints
- Foreign key constraints to maintain referential integrity
- Unique constraints on username and email in User table
- Check constraints to validate enum values
- Cascade delete for user removal (deletes associated tasks and tags)
- Prevent deletion of tags currently assigned to tasks (soft delete instead)