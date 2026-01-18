# Data Model

## Entities

### Task
- **Fields**:
  - id: UUID (primary key)
  - title: String (1-255 characters, required)
  - description: String (0-1000 characters, optional)
  - status: Enum ('active', 'completed') - default: 'active'
  - priority: Enum ('high', 'medium', 'low') - default: 'medium'
  - due_date: DateTime (nullable)
  - created_at: DateTime (auto-generated)
  - updated_at: DateTime (auto-generated)
  - completed_at: DateTime (nullable)
  - user_id: UUID (foreign key to User)
  - recurrence_pattern_id: UUID (foreign key to RecurrencePattern, nullable)

- **Relationships**:
  - Belongs to User (many-to-one)
  - Has many Tags through TaskTag (many-to-many)
  - Belongs to RecurrencePattern (many-to-one, optional)

- **Validation Rules**:
  - Title must be 1-255 characters
  - Due date must be in the future if provided
  - Priority must be one of 'high', 'medium', 'low'

### User
- **Fields**:
  - id: UUID (primary key)
  - username: String (unique, 3-50 characters)
  - email: String (unique, valid email format)
  - password_hash: String (hashed password)
  - created_at: DateTime (auto-generated)
  - updated_at: DateTime (auto-generated)
  - is_active: Boolean (default: true)
  - preferences: JSON (theme preference, notification settings, etc.)

- **Relationships**:
  - Has many Tasks (one-to-many)
  - Has many Tags (one-to-many)

- **Validation Rules**:
  - Username must be 3-50 alphanumeric characters with underscores/hyphens
  - Email must be valid email format
  - Password must meet strength requirements

### Tag
- **Fields**:
  - id: UUID (primary key)
  - name: String (1-50 characters, unique per user)
  - color: String (hex color code, optional)
  - user_id: UUID (foreign key to User)
  - created_at: DateTime (auto-generated)

- **Relationships**:
  - Belongs to User (many-to-one)
  - Many-to-many relationship with Task through TaskTag

- **Validation Rules**:
  - Name must be 1-50 characters
  - Name must be unique per user

### RecurrencePattern
- **Fields**:
  - id: UUID (primary key)
  - pattern_type: Enum ('daily', 'weekly', 'monthly', 'yearly')
  - interval: Integer (positive, default: 1)
  - end_condition: Enum ('never', 'after', 'on_date')
  - end_count: Integer (nullable, for 'after' condition)
  - end_date: Date (nullable, for 'on_date' condition)
  - created_at: DateTime (auto-generated)
  - updated_at: DateTime (auto-generated)

- **Relationships**:
  - Has many Tasks (one-to-many)

- **Validation Rules**:
  - Interval must be positive
  - If end_condition is 'after', end_count must be provided and positive
  - If end_condition is 'on_date', end_date must be provided and in the future

### TaskTag (Junction Table)
- **Fields**:
  - task_id: UUID (foreign key to Task)
  - tag_id: UUID (foreign key to Tag)

- **Relationships**:
  - Belongs to Task (many-to-one)
  - Belongs to Tag (many-to-one)

- **Validation Rules**:
  - Combination of task_id and tag_id must be unique

## State Transitions

### Task Status Transitions
- active → completed (when user marks task as complete)
- completed → active (when user unmarks task as complete)

### Task Lifecycle
- Created with 'active' status
- Can be updated (title, description, priority, due date, tags)
- Can be marked as completed
- Can be deleted (soft delete with deleted_at timestamp)

## Indexes for Performance
- User.id (primary key)
- User.username (unique index)
- User.email (unique index)
- Task.user_id (index for filtering by user)
- Task.status (index for filtering by status)
- Task.priority (index for filtering by priority)
- Task.due_date (index for sorting and filtering by due date)
- Task.created_at (index for chronological operations)
- Tag.user_id (index for filtering by user)
- Tag.name (index for searching by tag name)

## Additional Requirements Implementation

### TDD Implementation
- Unit tests for all models with 100% coverage
- Integration tests for all CRUD operations
- Test-driven development approach for all new features

### Test Coverage
- Maintain 95% test coverage across all components
- Coverage reports for backend, frontend, API, and E2E tests
- Automated coverage checks in CI pipeline

### Performance Requirements
- API response times <200ms (p95)
- Page load times <3s
- Search/filter operations <2s
- Optimized database queries with proper indexing

### Accessibility Compliance
- WCAG 2.1 AA compliance for all UI components
- Keyboard navigation support
- Screen reader compatibility
- Proper color contrast ratios
- ARIA attributes for dynamic content

### Recurring Task Scheduler
- Background job scheduler for recurring tasks
- Cron-like pattern support
- Timezone-aware scheduling
- Retry mechanisms for failed tasks