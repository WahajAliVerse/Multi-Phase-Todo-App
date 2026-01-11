# Full-Stack Todo API Documentation

## Base URL
All API endpoints are rooted at `/api/v1/`

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Tasks

#### GET /tasks
Retrieve a list of tasks with optional filtering, sorting, and pagination.

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 100, max: 1000)
- `status`: Filter by status (active, completed)
- `priority`: Filter by priority (low, medium, high)
- `due_date`: Filter by due date
- `search`: Search in title and description
- `sort`: Sort by field (due_date, priority, alphabetical, created_date)
- `sort_order`: Sort order (asc, desc, default: asc)

**Rate Limit:** 10 requests per minute per IP

**Response:**
```json
{
  "status_code": 200,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [...],
    "total": 10,
    "page": 1,
    "limit": 100
  }
}
```

#### GET /tasks/{task_id}
Retrieve a specific task by ID.

**Rate Limit:** 15 requests per minute per IP

**Response:**
```json
{
  "status_code": 200,
  "message": "Task retrieved successfully",
  "data": { ...task_object }
}
```

#### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Task title (required)",
  "description": "Task description (optional)",
  "priority": "Task priority (low, medium, high; default: medium)",
  "due_date": "ISO date string (optional)",
  "tags": "Comma-separated tag names (optional)",
  "recurrence_pattern": "Pattern type (daily, weekly, monthly, yearly; optional)",
  "interval": "Recurrence interval (integer, default: 1)"
}
```

**Rate Limit:** 5 requests per minute per IP

**Response:**
```json
{
  "status_code": 201,
  "message": "Task created successfully",
  "data": { ...task_object }
}
```

#### PUT /tasks/{task_id}
Update an existing task.

**Rate Limit:** 5 requests per minute per IP

**Request Body:**
Same fields as POST but all are optional.

**Response:**
```json
{
  "status_code": 200,
  "message": "Task updated successfully",
  "data": { ...task_object }
}
```

#### DELETE /tasks/{task_id}
Delete a task by ID.

**Rate Limit:** 5 requests per minute per IP

**Response:**
```json
{
  "status_code": 200,
  "message": "Task deleted successfully"
}
```

### Tags

#### GET /tags
Retrieve all tags for the authenticated user.

**Rate Limit:** 10 requests per minute per IP

**Response:**
```json
{
  "status_code": 200,
  "message": "Tags retrieved successfully",
  "data": [...tag_objects]
}
```

#### POST /tags
Create a new tag.

**Rate Limit:** 5 requests per minute per IP

**Request Body:**
```json
{
  "name": "Tag name (required, 1-50 chars)",
  "color": "Hex color code (optional)"
}
```

**Response:**
```json
{
  "status_code": 201,
  "message": "Tag created successfully",
  "data": { ...tag_object }
}
```

#### PUT /tags/{tag_id}
Update an existing tag.

**Rate Limit:** 5 requests per minute per IP

**Request Body:**
```json
{
  "name": "New tag name (optional, 1-50 chars)",
  "color": "New hex color code (optional)"
}
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Tag updated successfully",
  "data": { ...tag_object }
}
```

#### DELETE /tags/{tag_id}
Delete a tag by ID.

**Rate Limit:** 5 requests per minute per IP

**Response:**
```json
{
  "status_code": 200,
  "message": "Tag deleted successfully"
}
```

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "Username (required)",
  "email": "Email address (required)",
  "password": "Password (required)"
}
```

**Response:**
```json
{
  "status_code": 201,
  "message": "User registered successfully",
  "data": { ...user_object }
}
```

#### POST /auth/login
Authenticate user and get JWT tokens.

**Request Body:**
```json
{
  "username": "Username (required)",
  "password": "Password (required)"
}
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Login successful",
  "data": {
    "access_token": "...",
    "token_type": "bearer"
  }
}
```

## Error Responses
All error responses follow this format:
```json
{
  "status_code": <status_code>,
  "error": {
    "code": "<error_code>",
    "message": "<error_message>",
    "details": { ...optional_details }
  }
}
```

## Rate Limits
Most endpoints have rate limits to prevent abuse:
- GET endpoints: 10-15 requests per minute
- POST/PUT/DELETE endpoints: 5 requests per minute

## Common Error Codes
- `VALIDATION_ERROR`: Request data doesn't meet validation requirements
- `UNAUTHORIZED`: User is not authenticated or lacks permissions
- `NOT_FOUND`: Requested resource doesn't exist
- `CONFLICT`: Request conflicts with existing data (e.g., duplicate)
- `INTERNAL_ERROR`: Server-side error occurred