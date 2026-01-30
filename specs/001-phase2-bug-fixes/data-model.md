# Data Model: Phase 2 Bug Fixes and Enhancements for Full-Stack Todo App

## Overview
This document defines the data models for the Phase 2 full-stack todo application, including entities, relationships, and validation rules.

## Entity Definitions

### User
Represents a person using the application with authentication credentials and preferences.

**Fields:**
- `id` (UUID/string): Unique identifier for the user
- `username` (string, 3-30 chars): Unique username for login
- `email` (string, valid email format): User's email address
- `hashed_password` (string): BCrypt hashed password
- `is_active` (boolean): Account status
- `created_at` (datetime): Account creation timestamp
- `updated_at` (datetime): Last update timestamp
- `preferences` (JSON object): User preferences including theme (light/dark) and notification settings

**Validation Rules:**
- Username must be unique and 3-30 alphanumeric characters with underscores/hyphens
- Email must be valid and unique
- Password must meet complexity requirements (handled during hashing)
- Created/updated timestamps are automatically managed

### Task
Represents a todo item with various attributes for organization and tracking.

**Fields:**
- `id` (UUID/string): Unique identifier for the task
- `title` (string, 1-100 chars): Task title
- `description` (string, optional, max 500 chars): Detailed task description
- `status` (enum: 'active', 'completed'): Current task status
- `priority` (enum: 'high', 'medium', 'low'): Task priority level
- `due_date` (datetime, optional): Deadline for the task
- `created_at` (datetime): Task creation timestamp
- `updated_at` (datetime): Last update timestamp
- `completed_at` (datetime, optional): Timestamp when task was marked complete
- `user_id` (UUID/string): Foreign key linking to the owning user
- `recurrence_pattern_id` (UUID/string, optional): Foreign key to recurrence pattern
- `tags` (array of UUID/strings): Collection of tag IDs associated with the task

**Validation Rules:**
- Title is required and must be 1-100 characters
- Status must be one of the allowed values
- Priority must be one of the allowed values
- Due date must be a valid future date if provided
- User ID must reference an existing user
- Recurrence pattern ID must reference an existing pattern if provided

### Tag
Represents a category or label that can be applied to tasks for organization and filtering.

**Fields:**
- `id` (UUID/string): Unique identifier for the tag
- `name` (string, 1-50 chars): Tag name
- `color` (string, hex format): Color code for visual identification
- `user_id` (UUID/string): Foreign key linking to the owning user
- `created_at` (datetime): Tag creation timestamp

**Validation Rules:**
- Name is required and must be 1-50 characters
- Color must be a valid hex color code
- User ID must reference an existing user

### Session
Represents an authenticated user session with JWT token information.

**Fields:**
- `id` (UUID/string): Unique identifier for the session
- `user_id` (UUID/string): Foreign key linking to the user
- `token_hash` (string): Hash of the JWT token for validation
- `expires_at` (datetime): Session expiration timestamp
- `created_at` (datetime): Session creation timestamp
- `last_accessed_at` (datetime): Last time the session was used

**Validation Rules:**
- User ID must reference an existing user
- Expiration must be in the future
- Token hash is required

### Reminder
Represents a scheduled notification for a task with timing and delivery status.

**Fields:**
- `id` (UUID/string): Unique identifier for the reminder
- `task_id` (UUID/string): Foreign key linking to the associated task
- `scheduled_time` (datetime): When the reminder should trigger
- `delivery_status` (enum: 'pending', 'sent', 'delivered', 'failed'): Status of the reminder delivery
- `created_at` (datetime): Reminder creation timestamp
- `sent_at` (datetime, optional): When the reminder was sent

**Validation Rules:**
- Task ID must reference an existing task
- Scheduled time must be in the future
- Delivery status must be one of the allowed values

### RecurrencePattern
Defines how a task repeats over time with various interval and end conditions.

**Fields:**
- `id` (UUID/string): Unique identifier for the pattern
- `pattern_type` (enum: 'daily', 'weekly', 'monthly', 'yearly'): Type of recurrence
- `interval` (integer, positive): How often the pattern repeats (every N days/weeks/etc)
- `end_condition` (enum: 'never', 'after_occurrences', 'on_date'): When the recurrence ends
- `occurrence_count` (integer, optional): Number of occurrences for 'after_occurrences' condition
- `end_date` (datetime, optional): Date for 'on_date' condition
- `days_of_week` (string, optional): Days for weekly patterns (e.g., 'mon,tue,fri')
- `days_of_month` (string, optional): Days for monthly patterns (e.g., '1,15')
- `created_at` (datetime): Pattern creation timestamp
- `updated_at` (datetime): Last update timestamp

**Validation Rules:**
- Pattern type must be one of the allowed values
- Interval must be a positive integer
- End condition must be one of the allowed values
- Occurrence count required if end condition is 'after_occurrences'
- End date required if end condition is 'on_date'
- Days of week/month format must be valid if specified

## Relationships

### User ↔ Task
- One-to-many relationship (one user can have many tasks)
- Foreign key: `user_id` in Task references `id` in User
- Cascade delete: When a user is deleted, their tasks are also deleted

### User ↔ Tag
- One-to-many relationship (one user can have many tags)
- Foreign key: `user_id` in Tag references `id` in User
- Cascade delete: When a user is deleted, their tags are also deleted

### Task ↔ Tag
- Many-to-many relationship (tasks can have multiple tags, tags can be applied to multiple tasks)
- Implemented through the `tags` array field in Task referencing Tag IDs
- No cascade delete: Removing a tag doesn't affect tasks, removing a task doesn't affect tags

### Task ↔ Reminder
- One-to-one relationship (one task has one reminder)
- Foreign key: `task_id` in Reminder references `id` in Task
- Cascade delete: When a task is deleted, its reminder is also deleted

### Task ↔ RecurrencePattern
- One-to-zero-or-one relationship (a task optionally has one recurrence pattern)
- Foreign key: `recurrence_pattern_id` in Task references `id` in RecurrencePattern
- Cascade delete: When a pattern is deleted, the reference in Task is set to NULL

## State Transitions

### Task Status Transitions
- `active` → `completed`: When user marks task as complete
- `completed` → `active`: When user reopens completed task
- On completion: `completed_at` is set to current timestamp
- On reopening: `completed_at` is set to NULL

### Reminder Delivery Status Transitions
- `pending` → `sent`: When reminder is sent to delivery service
- `sent` → `delivered`: When delivery service confirms delivery
- `sent` → `failed`: When delivery service reports failure
- `pending` → `failed`: When reminder cannot be delivered due to system issues

### Session Status Transitions
- `active` (implicit): When session is created and valid
- Expired: When `expires_at` is in the past (no explicit status field needed)
- Revoked: When session is manually invalidated by user or admin