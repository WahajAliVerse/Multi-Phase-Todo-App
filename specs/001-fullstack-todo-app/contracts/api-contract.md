# API Contract: Full-Stack Web Application (Phase II)

## Base URL
`/api/v1`

## Authentication
All endpoints (except login/register) require a valid JWT token in the Authorization header:
`Authorization: Bearer {token}`

## Endpoints

### User Management

#### POST /auth/register
Register a new user
- Request: `{username: string, email: string, password: string}`
- Response: `{id: string, username: string, email: string, created_at: datetime}`
- Error: 400 (validation error), 409 (username/email already exists)

#### POST /auth/login
Authenticate user and return JWT tokens
- Request: `{username: string, password: string}`
- Response: `{access_token: string, refresh_token: string, token_type: "bearer"}`
- Error: 401 (invalid credentials)

#### POST /auth/refresh
Refresh access token using refresh token
- Request: `{refresh_token: string}`
- Response: `{access_token: string, token_type: "bearer"}`
- Error: 401 (invalid refresh token)

### Task Management

#### GET /tasks
Retrieve tasks with optional filtering, sorting, and pagination
- Query params: `status`, `priority`, `due_date`, `search`, `sort`, `page`, `limit`
- Response: `{tasks: Task[], total: number, page: number, limit: number}`
- Error: 401 (unauthorized)

#### GET /tasks/{id}
Retrieve a specific task
- Response: `Task`
- Error: 401 (unauthorized), 404 (task not found)

#### POST /tasks
Create a new task
- Request: `{title: string, description?: string, priority?: 'low'|'medium'|'high', due_date?: datetime, tags?: string[], recurrence_pattern?: RecurrencePattern}`
- Response: `Task`
- Error: 400 (validation error), 401 (unauthorized)

#### PUT /tasks/{id}
Update an existing task
- Request: `{title?: string, description?: string, status?: 'active'|'completed', priority?: 'low'|'medium'|'high', due_date?: datetime, tags?: string[], recurrence_pattern?: RecurrencePattern}`
- Response: `Task`
- Error: 400 (validation error), 401 (unauthorized), 404 (task not found)

#### DELETE /tasks/{id}
Delete a task
- Response: `{message: "Task deleted successfully"}`
- Error: 401 (unauthorized), 404 (task not found)

### Tag Management

#### GET /tags
Retrieve all tags for the authenticated user
- Response: `Tag[]`
- Error: 401 (unauthorized)

#### POST /tags
Create a new tag
- Request: `{name: string, color?: string}`
- Response: `Tag`
- Error: 400 (validation error), 401 (unauthorized), 409 (tag already exists)

#### PUT /tags/{id}
Update an existing tag
- Request: `{name?: string, color?: string}`
- Response: `Tag`
- Error: 400 (validation error), 401 (unauthorized), 404 (tag not found)

#### DELETE /tags/{id}
Delete a tag
- Response: `{message: "Tag deleted successfully"}`
- Error: 401 (unauthorized), 404 (tag not found)

## Common Response Format

Success responses follow this pattern:
```json
{
  "data": { ... },
  "message": "Success message"
}
```

Error responses follow this pattern:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

## Common Error Codes
- `VALIDATION_ERROR`: Request data doesn't meet validation requirements
- `UNAUTHORIZED`: User is not authenticated or lacks permissions
- `NOT_FOUND`: Requested resource doesn't exist
- `CONFLICT`: Request conflicts with existing data (e.g., duplicate)
- `INTERNAL_ERROR`: Server-side error occurred