# API Contract: Full-Stack Web Application (Phase II)

## Base URL
`https://api.yourapp.com/v1` (production)  
`http://localhost:8000/v1` (development)

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Common Headers
- `Content-Type: application/json`
- `Accept: application/json`

## Error Format
All error responses follow this format:
```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2023-01-01T00:00:00Z"
}
```

## Endpoints

### Authentication

#### POST /auth/login
Login with username/email and password to receive JWT tokens.

Request:
```json
{
  "username": "user@example.com",
  "password": "securePassword123"
}
```

Response (200 OK):
```json
{
  "access_token": "jwt_access_token",
  "refresh_token": "jwt_refresh_token",
  "token_type": "bearer"
}
```

Errors:
- 401: Invalid credentials
- 422: Validation error

#### POST /auth/register
Register a new user account.

Request:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "securePassword123"
}
```

Response (201 Created):
```json
{
  "id": "uuid-string",
  "username": "newuser",
  "email": "newuser@example.com",
  "created_at": "2023-01-01T00:00:00Z"
}
```

Errors:
- 400: Username or email already registered
- 422: Validation error

#### POST /auth/refresh
Refresh the access token using the refresh token.

Request:
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

Response (200 OK):
```json
{
  "access_token": "new_jwt_access_token",
  "token_type": "bearer"
}
```

Errors:
- 401: Invalid refresh token

### Users

#### GET /users/me
Get current user profile.

Response (200 OK):
```json
{
  "id": "uuid-string",
  "username": "username",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "preferences": {
    "theme": "light"
  }
}
```

#### PUT /users/me
Update current user profile.

Request:
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "preferences": {
    "theme": "dark"
  }
}
```

Response (200 OK):
```json
{
  "id": "uuid-string",
  "username": "newusername",
  "email": "newemail@example.com",
  "is_active": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "preferences": {
    "theme": "dark"
  }
}
```

Errors:
- 400: Email or username already in use
- 422: Validation error

### Tasks

#### GET /tasks
Retrieve a list of tasks with optional filtering, searching, and sorting.

Query Parameters:
- `skip` (integer): Number of records to skip (default: 0)
- `limit` (integer): Maximum number of records to return (default: 100, max: 1000)
- `status` (string): Filter by status ('active', 'completed')
- `priority` (string): Filter by priority ('high', 'medium', 'low')
- `search` (string): Search term to match in title or description
- `sort_by` (string): Field to sort by ('created_at', 'due_date', 'priority', 'title')
- `sort_order` (string): Sort direction ('asc', 'desc', default: 'desc')

Response (200 OK):
```json
{
  "tasks": [
    {
      "id": "uuid-string",
      "title": "Sample Task",
      "description": "Task description",
      "status": "active",
      "priority": "high",
      "due_date": "2023-12-31T23:59:59Z",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z",
      "completed_at": null,
      "tags": [
        {
          "id": "tag-uuid",
          "name": "work",
          "color": "#FF5733"
        }
      ],
      "recurrence_pattern": {
        "id": "recurrence-uuid",
        "pattern_type": "weekly",
        "interval": 1,
        "end_date": null,
        "occurrences_count": 10
      }
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

#### POST /tasks
Create a new task.

Request:
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "medium",
  "due_date": "2023-12-31T23:59:59Z",
  "tags": ["work", "important"],
  "recurrence_pattern": {
    "pattern_type": "weekly",
    "interval": 1,
    "end_date": "2024-12-31T23:59:59Z"
  }
}
```

Response (201 Created):
```json
{
  "id": "uuid-string",
  "title": "New Task",
  "description": "Task description",
  "status": "active",
  "priority": "medium",
  "due_date": "2023-12-31T23:59:59Z",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "completed_at": null,
  "tags": [
    {
      "id": "tag-uuid",
      "name": "work",
      "color": "#FF5733"
    },
    {
      "id": "tag-uuid2",
      "name": "important",
      "color": "#33FF57"
    }
  ],
  "recurrence_pattern": {
    "id": "recurrence-uuid",
    "pattern_type": "weekly",
    "interval": 1,
    "end_date": "2024-12-31T23:59:59Z",
    "occurrences_count": null
  }
}
```

Errors:
- 422: Validation error

#### GET /tasks/{task_id}
Retrieve a specific task by ID.

Response (200 OK):
```json
{
  "id": "uuid-string",
  "title": "Sample Task",
  "description": "Task description",
  "status": "active",
  "priority": "high",
  "due_date": "2023-12-31T23:59:59Z",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "completed_at": null,
  "tags": [
    {
      "id": "tag-uuid",
      "name": "work",
      "color": "#FF5733"
    }
  ],
  "recurrence_pattern": null
}
```

Errors:
- 404: Task not found

#### PUT /tasks/{task_id}
Update an existing task.

Request:
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "priority": "high",
  "due_date": "2023-12-31T23:59:59Z",
  "status": "completed"
}
```

Response (200 OK):
```json
{
  "id": "uuid-string",
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "completed",
  "priority": "high",
  "due_date": "2023-12-31T23:59:59Z",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z",
  "completed_at": "2023-01-01T00:00:00Z",
  "tags": [
    {
      "id": "tag-uuid",
      "name": "work",
      "color": "#FF5733"
    }
  ],
  "recurrence_pattern": null
}
```

Errors:
- 404: Task not found
- 422: Validation error

#### DELETE /tasks/{task_id}
Delete a task.

Response (204 No Content)

Errors:
- 404: Task not found

#### PATCH /tasks/{task_id}/toggle-status
Toggle the status of a task between active and completed.

Response (200 OK):
```json
{
  "id": "uuid-string",
  "status": "completed",
  "completed_at": "2023-01-01T00:00:00Z"
}
```

Errors:
- 404: Task not found

### Tags

#### GET /tags
Retrieve a list of tags for the current user.

Query Parameters:
- `skip` (integer): Number of records to skip (default: 0)
- `limit` (integer): Maximum number of records to return (default: 100, max: 1000)

Response (200 OK):
```json
{
  "tags": [
    {
      "id": "uuid-string",
      "name": "work",
      "color": "#FF5733",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

#### POST /tags
Create a new tag.

Request:
```json
{
  "name": "personal",
  "color": "#33FF57"
}
```

Response (201 Created):
```json
{
  "id": "uuid-string",
  "name": "personal",
  "color": "#33FF57",
  "created_at": "2023-01-01T00:00:00Z"
}
```

Errors:
- 400: Tag name already exists for user
- 422: Validation error

#### PUT /tags/{tag_id}
Update an existing tag.

Request:
```json
{
  "name": "home",
  "color": "#3357FF"
}
```

Response (200 OK):
```json
{
  "id": "uuid-string",
  "name": "home",
  "color": "#3357FF",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:01Z"
}
```

Errors:
- 404: Tag not found
- 400: Tag name already exists for user
- 422: Validation error

#### DELETE /tags/{tag_id}
Delete a tag. This will remove the tag from all associated tasks.

Response (204 No Content)

Errors:
- 404: Tag not found

## Common HTTP Status Codes
- 200: OK - Request successful
- 201: Created - Resource created successfully
- 204: No Content - Request successful, no content to return
- 400: Bad Request - Invalid request format
- 401: Unauthorized - Authentication required
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource does not exist
- 409: Conflict - Resource already exists or conflict with current state
- 422: Unprocessable Entity - Validation error
- 500: Internal Server Error - Unexpected server error