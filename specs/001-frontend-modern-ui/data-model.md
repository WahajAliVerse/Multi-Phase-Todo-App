# Data Model: Frontend Modern UI Upgrade

## Entities

### User
- **Fields**:
  - id: string (unique identifier)
  - email: string (email address, validated format)
  - name: string (optional display name)
  - createdAt: Date (account creation timestamp)
  - updatedAt: Date (last update timestamp)
  - preferences: object (theme preference, notification settings)

- **Validation Rules**:
  - Email must follow standard email format
  - Name must be 1-50 characters if provided
  - ID must be unique

- **State Transitions**:
  - Unauthenticated → Authenticated (on successful login)
  - Authenticated → Unauthenticated (on logout)

### Task
- **Fields**:
  - id: string (unique identifier)
  - title: string (task title, required)
  - description: string (optional detailed description)
  - completed: boolean (completion status)
  - priority: enum ('low' | 'medium' | 'high')
  - dueDate: Date (optional deadline)
  - createdAt: Date (creation timestamp)
  - updatedAt: Date (last update timestamp)
  - userId: string (owner reference)
  - tags: Array<string> (associated tag IDs)
  - recurrence: object (recurrence pattern if applicable)

- **Validation Rules**:
  - Title must be 1-100 characters
  - Priority must be one of the allowed values
  - Due date must be a valid future date if provided
  - UserId must reference an existing user

- **State Transitions**:
  - Pending → Completed (when marked as done)
  - Completed → Pending (when unmarked)

### Tag
- **Fields**:
  - id: string (unique identifier)
  - name: string (tag name, required)
  - color: string (color code for UI display)
  - userId: string (owner reference)
  - createdAt: Date (creation timestamp)
  - updatedAt: Date (last update timestamp)

- **Validation Rules**:
  - Name must be 1-30 characters
  - Color must be a valid hex color code
  - UserId must reference an existing user

- **Relationships**:
  - One-to-many with Task (one tag can be assigned to multiple tasks)

### Theme
- **Fields**:
  - mode: enum ('light' | 'dark')
  - updatedAt: Date (last change timestamp)

- **Validation Rules**:
  - Mode must be either 'light' or 'dark'

- **State Transitions**:
  - Light → Dark (on theme toggle)
  - Dark → Light (on theme toggle)

### Notification
- **Fields**:
  - id: string (unique identifier)
  - type: enum ('success' | 'error' | 'warning' | 'info')
  - message: string (notification content)
  - timestamp: Date (creation time)
  - duration: number (auto-dismiss duration in ms)

- **Validation Rules**:
  - Type must be one of the allowed values
  - Message must be 1-200 characters
  - Duration must be between 1000-10000 ms

### ModalState
- **Fields**:
  - mode: enum (0 = create, 1 = edit)
  - entityType: enum ('task' | 'tag' | 'user')
  - entityId: string (optional, for edit mode)
  - isOpen: boolean (visibility state)

- **Validation Rules**:
  - Mode must be 0 or 1
  - EntityType must be one of the allowed values
  - If mode is 1 (edit), entityId must be provided

- **State Transitions**:
  - Closed → Open (on create/edit action)
  - Open → Closed (on save/cancel/close action)