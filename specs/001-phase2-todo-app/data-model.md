# Data Model: Phase 2 Todo Application

## Entity Definitions

### User
Represents a registered user with authentication credentials and profile information.

**Fields**:
- id: UUID (primary key)
- email: String (unique, indexed)
- hashed_password: String (encrypted)
- first_name: String (optional)
- last_name: String (optional)
- created_at: DateTime
- updated_at: DateTime
- is_active: Boolean (default: true)
- theme_preference: String (enum: 'light', 'dark', default: 'light')
- notification_settings: JSON (default: {"email": true, "browser": true})

**Validation Rules**:
- Email must be valid email format
- Password must meet minimum strength requirements
- Email must be unique

**State Transitions**:
- inactive → active (upon email verification)
- active → inactive (upon account deletion request)

### Task
Represents a todo item with various attributes for organization and tracking.

**Fields**:
- id: UUID (primary key)
- title: String (required, max 200 chars)
- description: Text (optional)
- status: String (enum: 'pending', 'in_progress', 'completed', default: 'pending')
- priority: String (enum: 'low', 'medium', 'high', default: 'medium')
- due_date: DateTime (optional)
- created_at: DateTime
- updated_at: DateTime
- completed_at: DateTime (optional)
- user_id: UUID (foreign key to User)
- tag_ids: List[UUID] (many-to-many relationship with Tag)
- recurrence_pattern: JSON (optional, for recurring tasks)

**Validation Rules**:
- Title must not be empty
- Due date must be in the future if provided
- Priority must be one of allowed values
- Status must be one of allowed values

**State Transitions**:
- pending → in_progress (when user starts working on task)
- in_progress → pending (when user pauses work)
- pending → completed (when user marks as complete)
- in_progress → completed (when user finishes work)
- completed → pending (when user reopens task)

### Tag
Represents a category or label that can be assigned to tasks for organization and filtering.

**Fields**:
- id: UUID (primary key)
- name: String (required, unique per user, max 50 chars)
- color: String (hex color code, optional)
- created_at: DateTime
- updated_at: DateTime
- user_id: UUID (foreign key to User)

**Validation Rules**:
- Name must not be empty
- Name must be unique per user
- Color must be valid hex format if provided

**State Transitions**:
- No state transitions (tags are static once created)

### Notification
Represents alerts sent to users for task reminders and updates.

**Fields**:
- id: UUID (primary key)
- type: String (enum: 'email', 'browser', 'push')
- title: String (required)
- message: Text (required)
- sent_at: DateTime
- delivered_at: DateTime (optional)
- read_at: DateTime (optional)
- user_id: UUID (foreign key to User)
- task_id: UUID (foreign key to Task, optional)

**Validation Rules**:
- Type must be one of allowed values
- Title and message must not be empty

**State Transitions**:
- unsent → sent (when notification is dispatched)
- sent → delivered (when delivery confirmed)
- delivered → read (when user opens notification)

### RecurrencePattern
Defines the recurrence rules for recurring tasks.

**Fields**:
- id: UUID (primary key)
- frequency: String (enum: 'daily', 'weekly', 'monthly', 'yearly')
- interval: Integer (default: 1)
- days_of_week: List[String] (for weekly, enum: 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')
- day_of_month: Integer (for monthly, 1-31, optional)
- end_condition: String (enum: 'never', 'after', 'on_date')
- end_after_occurrences: Integer (optional)
- end_date: Date (optional)
- created_at: DateTime
- updated_at: DateTime

**Validation Rules**:
- Frequency must be one of allowed values
- Interval must be positive
- Days of week must be valid if frequency is weekly
- Day of month must be valid if frequency is monthly
- End conditions must be consistent

**State Transitions**:
- No state transitions (patterns are static once created)

## Relationships

### User ↔ Task
- One-to-many relationship
- User can have many tasks
- Task belongs to one user

### User ↔ Tag
- One-to-many relationship
- User can have many tags
- Tag belongs to one user

### Task ↔ Tag
- Many-to-many relationship
- Task can have multiple tags
- Tag can be assigned to multiple tasks

### User ↔ Notification
- One-to-many relationship
- User can have many notifications
- Notification belongs to one user

### Task ↔ Notification
- One-to-many relationship (optional)
- Task can have many notifications
- Notification can belong to one task

### Task ↔ RecurrencePattern
- One-to-one relationship (optional)
- Task can have one recurrence pattern
- Recurrence pattern can be used by one task

## Indexes

- User.email: Unique index for fast authentication
- Task.user_id: Index for filtering tasks by user
- Task.status: Index for filtering by status
- Task.priority: Index for filtering by priority
- Task.due_date: Index for sorting by due date
- Task.created_at: Index for chronological ordering
- Tag.user_id: Index for filtering tags by user
- Notification.user_id: Index for filtering notifications by user
- Notification.sent_at: Index for ordering notifications chronologically