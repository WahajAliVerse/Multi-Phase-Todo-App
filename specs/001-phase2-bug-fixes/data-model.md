# Data Model: Phase 2 Bug Fixes and Enhancements for Full-Stack Todo App

## Overview
This document defines the data model for the full-stack Todo application, addressing the issues identified in the bug root cause analysis. The model reflects the key entities from the feature specification with proper relationships and constraints.

## Entities

### User
Represents a person using the application, with authentication credentials (username, email, hashed password), preferences (theme, notification settings), and associated tasks.

**Fields**:
- id: UUID (Primary Key)
- username: String (Unique, Not Null)
- email: String (Unique, Not Null, Valid Email Format)
- hashed_password: String (Not Null)
- is_active: Boolean (Default: True)
- preferences: JSON (Optional, for theme and notification settings)
- created_at: DateTime (Auto-generated)
- updated_at: DateTime (Auto-generated)

**Relationships**:
- One-to-Many: User -> Task
- One-to-Many: User -> Tag
- One-to-Many: User -> Reminder

**Validation Rules**:
- Username must be 3-50 characters
- Email must follow standard email format
- Password must be hashed using bcrypt or similar

### Task
Represents a todo item with title, description, status (active/completed), priority (high/medium/low), due date, creation/update timestamps, completion timestamp, user ID, recurrence pattern ID, and associated tags.

**Fields**:
- id: UUID (Primary Key)
- title: String (Not Null, Max 200 chars)
- description: Text (Optional)
- status: String (Enum: 'active', 'completed', Default: 'active')
- priority: String (Enum: 'low', 'medium', 'high', Default: 'medium')
- due_date: DateTime (Optional)
- created_at: DateTime (Auto-generated)
- updated_at: DateTime (Auto-generated)
- completed_at: DateTime (Optional)
- user_id: UUID (Foreign Key: User.id, Not Null)
- recurrence_pattern_id: UUID (Foreign Key: RecurrencePattern.id, Optional)

**Indexes**:
- idx_status: ON status (for filtering)
- idx_priority: ON priority (for sorting)
- idx_due_date: ON due_date (for date-based queries)
- idx_user_id: ON user_id (for user-specific queries)

**Relationships**:
- Many-to-One: Task -> User
- Many-to-One: Task -> RecurrencePattern (Optional)
- Many-to-Many: Task <-> Tag (via association table)

**Validation Rules**:
- Title must be 1-200 characters
- Status must be one of the allowed values
- Priority must be one of the allowed values
- Due date must be in the future if provided

### Tag
Represents a category or label that can be applied to tasks for organization and filtering, with name, color, user ID, and creation timestamp.

**Fields**:
- id: UUID (Primary Key)
- name: String (Not Null, Max 50 chars)
- color: String (Hex color code, Optional)
- user_id: UUID (Foreign Key: User.id, Not Null)
- created_at: DateTime (Auto-generated)

**Relationships**:
- Many-to-One: Tag -> User
- Many-to-Many: Tag <-> Task (via association table)

**Validation Rules**:
- Name must be 1-50 characters
- Color must be valid hex format if provided

### Session
Represents an authenticated user session with JWT token and associated permissions.

**Fields**:
- id: UUID (Primary Key)
- token_hash: String (Not Null, Unique)
- user_id: UUID (Foreign Key: User.id, Not Null)
- expires_at: DateTime (Not Null)
- created_at: DateTime (Auto-generated)
- is_revoked: Boolean (Default: False)

**Relationships**:
- Many-to-One: Session -> User

**Validation Rules**:
- Token hash must be unique
- Expires at must be in the future

### Reminder
Represents a scheduled notification for a task with timing, delivery status, and associated task ID.

**Fields**:
- id: UUID (Primary Key)
- task_id: UUID (Foreign Key: Task.id, Not Null)
- reminder_time: DateTime (Not Null)
- is_delivered: Boolean (Default: False)
- created_at: DateTime (Auto-generated)

**Relationships**:
- Many-to-One: Reminder -> Task

**Validation Rules**:
- Reminder time must be in the future

### RecurrencePattern
Defines how a task repeats over time (daily, weekly, monthly, etc.) with interval, end conditions, and day/month specifications.

**Fields**:
- id: UUID (Primary Key)
- pattern_type: String (Enum: 'daily', 'weekly', 'monthly', 'yearly', Not Null)
- interval: Integer (Default: 1, Positive)
- end_condition: String (Enum: 'never', 'after_date', 'after_occurrences', Not Null)
- end_date: DateTime (Optional)
- end_occurrences: Integer (Optional, Positive)
- days_of_week: String[] (For weekly patterns, Optional)
- days_of_month: Integer[] (For monthly patterns, Optional)
- created_at: DateTime (Auto-generated)
- updated_at: DateTime (Auto-generated)

**Relationships**:
- One-to-Many: RecurrencePattern -> Task

**Validation Rules**:
- Interval must be positive
- End condition must be one of allowed values
- Days of week must be valid day abbreviations if provided
- Days of month must be valid day numbers if provided

## Relationships

### User ↔ Task
One-to-Many relationship where one user can have many tasks.
- Foreign Key: Task.user_id references User.id
- Cascade delete: Tasks are deleted when user is deleted

### Task ↔ Tag
Many-to-Many relationship where tasks can have multiple tags and tags can be applied to multiple tasks.
- Association Table: task_tags
- Fields: task_id (FK), tag_id (FK)
- Cascade delete: Association records removed when either task or tag is deleted

### Task → RecurrencePattern
Many-to-One relationship where tasks can optionally have a recurrence pattern.
- Foreign Key: Task.recurrence_pattern_id references RecurrencePattern.id
- Optional: Tasks don't need to have a recurrence pattern

### User ↔ Tag
Many-to-One relationship where tags belong to a specific user.
- Foreign Key: Tag.user_id references User.id
- Cascade delete: Tags are deleted when user is deleted

### Task → Reminder
One-to-Many relationship where tasks can have multiple reminders.
- Foreign Key: Reminder.task_id references Task.id
- Cascade delete: Reminders are deleted when task is deleted

### User → Session
One-to-Many relationship where users can have multiple sessions.
- Foreign Key: Session.user_id references User.id
- Cascade delete: Sessions are deleted when user is deleted

## State Transitions

### Task Status Transitions
- active → completed (when task is marked as done)
- completed → active (when task is reopened)

### Session State Transitions
- active → revoked (when user logs out or token is invalidated)
- active → expired (when token expires)

## Constraints

### Data Integrity
- All foreign key relationships must be validated
- Unique constraints on username and email in User table
- Proper indexing on frequently queried fields

### Security
- Passwords must be hashed before storage
- Session tokens must be stored securely
- Access control based on user ownership of data

### Performance
- Indexes on status, priority, due_date, and user_id fields in Task table
- Proper indexing strategy for efficient querying