# Data Model: Full-Stack Web Application (Phase II)

## Entities

### User
- **id**: UUID (primary key)
- **username**: String (3-50 chars, unique, alphanumeric and underscores only)
- **email**: String (valid email format, unique)
- **password_hash**: String (hashed using bcrypt)
- **created_at**: DateTime (timestamp)
- **updated_at**: DateTime (timestamp)
- **preferences**: JSON (theme preference, notification settings)
- **refresh_token_hash**: String (optional, for JWT refresh token)

### Task
- **id**: UUID (primary key)
- **title**: String (1-255 chars)
- **description**: Text (optional)
- **status**: Enum ('active', 'completed')
- **priority**: Enum ('high', 'medium', 'low')
- **due_date**: DateTime (nullable)
- **created_at**: DateTime (timestamp)
- **updated_at**: DateTime (timestamp)
- **completed_at**: DateTime (nullable)
- **user_id**: UUID (foreign key to User)
- **recurrence_pattern_id**: UUID (nullable, foreign key to RecurrencePattern)

### Tag
- **id**: UUID (primary key)
- **name**: String (1-50 chars)
- **color**: String (hex color code)
- **user_id**: UUID (foreign key to User)
- **created_at**: DateTime (timestamp)

### TaskTag (Junction Table)
- **task_id**: UUID (foreign key to Task)
- **tag_id**: UUID (foreign key to Tag)
- **created_at**: DateTime (timestamp)

### RecurrencePattern
- **id**: UUID (primary key)
- **pattern_type**: Enum ('daily', 'weekly', 'monthly', 'yearly')
- **interval**: Integer (e.g., every 2 weeks)
- **end_condition**: Enum ('never', 'after_occurrences', 'on_date')
- **occurrence_count**: Integer (nullable, for 'after_occurrences' condition)
- **end_date**: Date (nullable, for 'on_date' condition)
- **days_of_week**: String (for weekly patterns, e.g., 'mon,tue,fri')
- **days_of_month**: String (for monthly patterns, e.g., '1,15')
- **created_at**: DateTime (timestamp)
- **updated_at**: DateTime (timestamp)

## Relationships
- User (1) -> (Many) Task
- User (1) -> (Many) Tag
- Task (Many) -> (Many) Tag (via TaskTag)
- Task (0..1) -> (1) RecurrencePattern
- RecurrencePattern (1) -> (Many) Task

## Validation Rules
- Task.title: Required, 1-255 characters
- Task.priority: Required, one of 'high', 'medium', 'low'
- Task.due_date: If provided, must be in the future
- Tag.name: Required, 1-50 characters, unique per user
- User.username: Required, 3-50 characters, alphanumeric and underscores only
- User.email: Required, valid email format, unique
- Password: At least 8 characters with complexity requirements

## Indexes
- User.email (unique)
- User.username (unique)
- Task.user_id (foreign key index)
- Task.status (for filtering)
- Task.priority (for filtering)
- Task.due_date (for sorting/filtering)
- Task.created_at (for sorting)
- Tag.user_id (foreign key index)
- Tag.name (for searching)

## State Transitions
- Task: active -> completed (when marked complete), completed -> active (when unmarked)
- User: active (default) -> suspended (admin action)