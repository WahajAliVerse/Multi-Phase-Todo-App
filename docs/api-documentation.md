# API Documentation: Phase 2 Todo Application

## Overview

This document provides comprehensive documentation for the Phase 2 Todo Application API. The API follows RESTful design principles and uses HTTP-only cookies for authentication.

## Base URL

The base URL for all API endpoints is:
```
https://api.todoapp.com/v1
```

For local development, the base URL is:
```
http://localhost:8000/api
```

## Authentication

This API uses HTTP-only cookies for authentication. After successful login, the server sets a session cookie that must be included in subsequent requests. The cookie is automatically handled by browsers, so no manual inclusion is required when using browser-based clients.

### Login Endpoint

To obtain an authentication cookie, make a POST request to the `/auth/login` endpoint with email and password.

## Common Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Or in case of errors:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2023-01-01T00:00:00Z"
    },
    "access_token": "jwt-token-string"
  }
}
```

**Cookies Set:**
- `session_id`: HTTP-only session cookie

#### POST /auth/login
Authenticate a user and create a session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2023-01-01T00:00:00Z"
    },
    "access_token": "jwt-token-string"
  }
}
```

**Cookies Set:**
- `session_id`: HTTP-only session cookie

#### POST /auth/logout
Logout the current user and clear the session.

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

**Cookies Cleared:**
- `session_id`: Session cookie is cleared

#### GET /auth/me
Get information about the currently authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "theme_preference": "light",
    "notification_settings": {
      "email": true,
      "browser": true
    },
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z"
  }
}
```

### Tasks

#### GET /tasks
Retrieve all tasks for the current user with optional filtering and pagination.

**Query Parameters:**
- `skip` (integer, optional): Number of tasks to skip (default: 0)
- `limit` (integer, optional): Maximum number of tasks to return (default: 100, max: 1000)
- `status` (string, optional): Filter by task status (pending, in_progress, completed)
- `priority` (string, optional): Filter by task priority (low, medium, high)
- `search` (string, optional): Search term to match in title or description
- `sort_by` (string, optional): Field to sort by (due_date, priority, created_at, title)
- `sort_order` (string, optional): Sort order (asc, desc, default: asc)
- `date_from` (string, optional): Filter tasks created after this date (ISO 8601 format)
- `date_to` (string, optional): Filter tasks created before this date (ISO 8601 format)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-string",
        "title": "Task title",
        "description": "Task description",
        "status": "pending",
        "priority": "medium",
        "due_date": "2023-12-31T10:00:00Z",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z",
        "completed_at": null,
        "user_id": "uuid-string",
        "tag_ids": ["tag-uuid-1", "tag-uuid-2"],
        "recurrence_pattern": null
      }
    ],
    "total": 150,
    "offset": 0,
    "limit": 100
  }
}
```

#### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "title": "New task title",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "due_date": "2023-12-31T10:00:00Z",
  "tag_ids": ["tag-uuid-1", "tag-uuid-2"],
  "recurrence_pattern": {
    "frequency": "weekly",
    "interval": 1,
    "days_of_week": ["mon", "wed", "fri"],
    "end_condition": "after",
    "end_after_occurrences": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "New task title",
    "description": "Task description",
    "status": "pending",
    "priority": "medium",
    "due_date": "2023-12-31T10:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "completed_at": null,
    "user_id": "user-uuid-string",
    "tag_ids": ["tag-uuid-1", "tag-uuid-2"],
    "recurrence_pattern": {
      "frequency": "weekly",
      "interval": 1,
      "days_of_week": ["mon", "wed", "fri"],
      "end_condition": "after",
      "end_after_occurrences": 10
    }
  }
}
```

#### GET /tasks/{id}
Retrieve a specific task by ID.

**Path Parameters:**
- `id` (string): Task ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "Task title",
    "description": "Task description",
    "status": "pending",
    "priority": "medium",
    "due_date": "2023-12-31T10:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "completed_at": null,
    "user_id": "user-uuid-string",
    "tag_ids": ["tag-uuid-1", "tag-uuid-2"],
    "recurrence_pattern": null
  }
}
```

#### PUT /tasks/{id}
Update an existing task.

**Path Parameters:**
- `id` (string): Task ID

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2023-12-31T10:00:00Z",
  "tag_ids": ["tag-uuid-1", "tag-uuid-3"],
  "recurrence_pattern": {
    "frequency": "daily",
    "interval": 1,
    "end_condition": "on_date",
    "end_date": "2024-01-31T00:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "Updated task title",
    "description": "Updated task description",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2023-12-31T10:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z",  // Note: updated_at changed
    "completed_at": null,
    "user_id": "user-uuid-string",
    "tag_ids": ["tag-uuid-1", "tag-uuid-3"],
    "recurrence_pattern": {
      "frequency": "daily",
      "interval": 1,
      "end_condition": "on_date",
      "end_date": "2024-01-31T00:00:00Z"
    }
  }
}
```

#### DELETE /tasks/{id}
Delete a specific task.

**Path Parameters:**
- `id` (string): Task ID

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### PATCH /tasks/{id}/complete
Mark a task as complete.

**Path Parameters:**
- `id` (string): Task ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "Task title",
    "description": "Task description",
    "status": "completed",  // Status changed to completed
    "priority": "medium",
    "due_date": "2023-12-31T10:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z",  // updated_at changed
    "completed_at": "2023-01-02T10:00:00Z",  // completed_at set to current time
    "user_id": "user-uuid-string",
    "tag_ids": ["tag-uuid-1", "tag-uuid-2"],
    "recurrence_pattern": null
  }
}
```

#### PATCH /tasks/{id}/incomplete
Mark a task as incomplete.

**Path Parameters:**
- `id` (string): Task ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "Task title",
    "description": "Task description",
    "status": "pending",  // Status changed to pending
    "priority": "medium",
    "due_date": "2023-12-31T10:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z",  // updated_at changed
    "completed_at": null,  // completed_at set to null
    "user_id": "user-uuid-string",
    "tag_ids": ["tag-uuid-1", "tag-uuid-2"],
    "recurrence_pattern": null
  }
}
```

### Tags

#### GET /tags
Retrieve all tags for the current user.

**Query Parameters:**
- `skip` (integer, optional): Number of tags to skip (default: 0)
- `limit` (integer, optional): Maximum number of tags to return (default: 100, max: 1000)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-string",
        "name": "Work",
        "color": "#3b82f6",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z",
        "user_id": "user-uuid-string"
      }
    ],
    "total": 5,
    "offset": 0,
    "limit": 100
  }
}
```

#### POST /tags
Create a new tag.

**Request Body:**
```json
{
  "name": "Personal",
  "color": "#ef4444"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "name": "Personal",
    "color": "#ef4444",
    "created_at": "2023-01-02T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z",
    "user_id": "user-uuid-string"
  }
}
```

#### PUT /tags/{id}
Update an existing tag.

**Path Parameters:**
- `id` (string): Tag ID

**Request Body:**
```json
{
  "name": "Updated Personal",
  "color": "#8b5cf6"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "name": "Updated Personal",
    "color": "#8b5cf6",
    "created_at": "2023-01-02T00:00:00Z",
    "updated_at": "2023-01-03T00:00:00Z",  // updated_at changed
    "user_id": "user-uuid-string"
  }
}
```

#### DELETE /tags/{id}
Delete a specific tag.

**Path Parameters:**
- `id` (string): Tag ID

**Response:**
```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

### Notifications

#### GET /notifications/pending
Retrieve all pending notifications for the current user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "type": "email",
      "title": "Task Reminder",
      "message": "Your task 'Finish report' is due tomorrow",
      "sent_at": "2023-01-02T09:00:00Z",
      "delivered_at": "2023-01-02T09:00:05Z",
      "read_at": null,
      "user_id": "user-uuid-string",
      "task_id": "task-uuid-string"
    }
  ]
}
```

#### POST /notifications/settings
Update notification preferences for the current user.

**Request Body:**
```json
{
  "email": true,
  "browser": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": true,
    "browser": false
  }
}
```

## Rate Limiting

All API endpoints are subject to rate limiting to prevent abuse:
- General endpoints: 100 requests per minute per IP
- Authentication endpoints: 10 requests per minute per IP
- Task endpoints: 200 requests per minute per IP

When rate limits are exceeded, the API returns a 429 (Too Many Requests) status code:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later."
  }
}
```

## Error Codes

The API uses the following error codes:

- `400 BAD_REQUEST`: Request was malformed or contained invalid data
- `401 UNAUTHORIZED`: Authentication is required or has failed
- `403 FORBIDDEN`: Insufficient permissions to perform the action
- `404 NOT_FOUND`: Requested resource does not exist
- `409 CONFLICT`: Request conflicts with current state (e.g., duplicate email)
- `422 UNPROCESSABLE_ENTITY`: Request was well-formed but semantically invalid
- `429 TOO_MANY_REQUESTS`: Rate limit exceeded
- `500 INTERNAL_SERVER_ERROR`: Server error occurred

## Validation

All inputs are validated according to the following rules:

### User Validation
- Email: Must be a valid email format
- Password: Minimum 8 characters with at least one uppercase, one lowercase, and one number
- Names: Maximum 50 characters

### Task Validation
- Title: Required, maximum 200 characters
- Description: Optional, maximum 1000 characters
- Status: Must be one of "pending", "in_progress", "completed"
- Priority: Must be one of "low", "medium", "high"
- Due date: If provided, must be a valid ISO 8601 datetime string

### Tag Validation
- Name: Required, maximum 50 characters
- Color: If provided, must be a valid hex color code

## Security

- All sensitive data is transmitted over HTTPS
- Authentication uses HTTP-only cookies to prevent XSS attacks
- All inputs are validated and sanitized to prevent injection attacks
- Rate limiting is implemented to prevent abuse
- Passwords are hashed using bcrypt before storage