# Data Model for Full-Stack Todo Application

## Task Entity

**Fields:**
- `id`: UUID (Primary Key)
- `title`: String (1-255 characters, required)
- `description`: Text (optional)
- `status`: Enum (active/completed, default: active)
- `priority`: Enum (high/medium/low, default: medium)
- `due_date`: DateTime (optional)
- `created_at`: DateTime (auto-generated)
- `updated_at`: DateTime (auto-generated)
- `completed_at`: DateTime (optional)
- `recurrence_pattern`: String (optional, e.g., "daily", "weekly", "monthly")
- `recurrence_end_date`: DateTime (optional)
- `version`: Integer (for optimistic locking, default: 1)

**Relationships:**
- One-to-Many: Task → Tag (via task_tags junction table)
- One-to-One: Task → User (owner)

**Validation Rules:**
- Title must be 1-255 characters
- Due date must be in the future if provided
- Priority must be one of the allowed values
- Status must be one of the allowed values

## User Entity

**Fields:**
- `id`: UUID (Primary Key)
- `username`: String (unique, 3-50 characters)
- `email`: String (unique, valid email format)
- `hashed_password`: String (required)
- `is_active`: Boolean (default: true)
- `created_at`: DateTime (auto-generated)
- `updated_at`: DateTime (auto-generated)
- `theme_preference`: Enum (light/dark/auto, default: auto)

**Validation Rules:**
- Username must be 3-50 characters and unique
- Email must be valid format and unique
- Password must be properly hashed

## Tag Entity

**Fields:**
- `id`: UUID (Primary Key)
- `name`: String (1-50 characters, required)
- `color`: String (hex color code, optional)
- `created_at`: DateTime (auto-generated)
- `user_id`: UUID (Foreign Key to User)

**Relationships:**
- Many-to-Many: Tag → Task (via task_tags junction table)
- One-to-Many: User → Tag

**Validation Rules:**
- Name must be 1-50 characters
- Name must be unique per user
- Color must be valid hex format if provided

## RecurrencePattern Entity

**Fields:**
- `id`: UUID (Primary Key)
- `pattern_type`: Enum (daily/weekly/monthly/yearly)
- `interval`: Integer (default: 1)
- `days_of_week`: String (for weekly patterns, e.g., "mon,tue,fri")
- `day_of_month`: Integer (for monthly patterns, 1-31)
- `end_condition`: Enum (never/after_date/after_occurrences)
- `end_date`: DateTime (optional)
- `max_occurrences`: Integer (optional)

**Validation Rules:**
- Interval must be positive
- Day of month must be valid
- End conditions must be consistent with values

## TaskTag Junction Table

**Fields:**
- `task_id`: UUID (Foreign Key to Task)
- `tag_id`: UUID (Foreign Key to Tag)

**Constraints:**
- Composite primary key (task_id, tag_id)
- Prevents duplicate tag assignments to same task

## State Transitions

### Task Status Transitions
- `active` → `completed` (when user marks task complete)
- `completed` → `active` (when user reopens task)

### Task Recurrence Behavior
- When a recurring task is completed, the system creates a new instance based on the recurrence pattern
- If recurrence_end_date is reached or max_occurrences is met, no new instances are created
- When a recurring task is deleted, all future occurrences are also deleted

## Indexes

- Task: indexes on `user_id`, `status`, `priority`, `due_date`, `created_at`, `version`
- Tag: indexes on `user_id`, `name`
- TaskTag: indexes on `task_id`, `tag_id`
- User: indexes on `username`, `email`