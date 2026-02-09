# Data Model: Frontend Debug Fixes

## Entities

### Tag
- **Fields**:
  - id: string (unique identifier)
  - name: string (tag name, 1-30 characters)
  - color: string (hex color code, e.g., "#3B82F6")
  - userId: string (associated user ID)
  - createdAt: string (ISO datetime)
  - updatedAt: string (ISO datetime)
  - taskCount?: number (number of tasks associated with this tag)

- **Validation rules**:
  - id: required, minimum 1 character
  - name: required, 1-30 characters, unique per user
  - color: required, valid hex color code format
  - userId: required, must match authenticated user

### Task
- **Fields**:
  - id: string (unique identifier)
  - title: string (task title, 1-100 characters)
  - description?: string (optional, max 1000 characters)
  - completed: boolean (completion status)
  - priority: 'low' | 'medium' | 'high' (default: 'medium')
  - dueDate?: string (ISO datetime format)
  - tags: string[] (array of tag IDs)
  - userId: string (owner user ID)
  - recurrence?: {
    - pattern: 'daily' | 'weekly' | 'monthly' | 'yearly'
    - interval: number (positive integer)
  }
  - createdAt: string (ISO datetime)
  - updatedAt: string (ISO datetime)

- **Validation rules**:
  - id: required, minimum 1 character
  - title: required, 1-100 characters
  - priority: required, enum of 'low', 'medium', 'high'
  - userId: required, must match authenticated user

### User
- **Fields**:
  - id: string (unique identifier)
  - email: string (valid email format)
  - name?: string (optional, 1-50 characters)
  - preferences?: {
    - theme: 'light' | 'dark'
  }
  - createdAt: string (ISO datetime)
  - updatedAt: string (ISO datetime)

- **Validation rules**:
  - id: required, minimum 1 character
  - email: required, valid email format
  - name: optional, 1-50 characters if provided

## State Transitions

### Task State Transitions
- `active` ↔ `completed` (toggle via UI action)
- `created` → `updated` (any field modification)
- `existing` → `deleted` (removal action)

### Tag State Transitions
- `created` → `updated` (name or color modification)
- `existing` → `deleted` (removal action)
- `assigned` → `unassigned` (when removed from tasks)