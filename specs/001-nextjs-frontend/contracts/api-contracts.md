# API Contract: Todo Application Backend Integration

## Overview
This document specifies the API contracts that the frontend application will use to communicate with the backend services. These endpoints represent the backend APIs that the frontend will consume to implement the required functionality.

## Base URL
`https://api.example.com/v1` (to be replaced with actual backend URL)

## Common Headers
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (where required)

## Endpoints

### 1. Get All Tasks
- **Method**: GET
- **Endpoint**: `/tasks`
- **Description**: Retrieve all tasks with optional filtering
- **Query Parameters**:
  - `status` (optional): Filter by task status ('pending', 'in-progress', 'completed')
  - `priority` (optional): Filter by priority ('low', 'medium', 'high')
  - `tag` (optional): Filter by tag
  - `search` (optional): Search term for title/description
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
- **Response**:
  - 200: `{ success: true, data: { tasks: [Task], totalCount: number, page: number, totalPages: number } }`
  - 401: Unauthorized
  - 500: Internal server error

### 2. Get Task by ID
- **Method**: GET
- **Endpoint**: `/tasks/{id}`
- **Description**: Retrieve a specific task by its ID
- **Path Parameters**:
  - `id`: Task identifier
- **Response**:
  - 200: `{ success: true, data: { task: Task } }`
  - 404: Task not found
  - 401: Unauthorized
  - 500: Internal server error

### 3. Create Task
- **Method**: POST
- **Endpoint**: `/tasks`
- **Description**: Create a new task
- **Request Body**:
  ```
  {
    "title": "Task title",
    "description": "Task description",
    "priority": "medium",
    "tags": ["work", "important"],
    "dueDate": "2023-12-31T23:59:59Z"
  }
  ```
- **Response**:
  - 201: `{ success: true, data: { task: Task } }`
  - 400: Invalid input
  - 401: Unauthorized
  - 500: Internal server error

### 4. Update Task
- **Method**: PUT
- **Endpoint**: `/tasks/{id}`
- **Description**: Update an existing task
- **Path Parameters**:
  - `id`: Task identifier
- **Request Body**:
  ```
  {
    "title": "Updated task title",
    "description": "Updated task description",
    "status": "in-progress",
    "priority": "high",
    "tags": ["work", "urgent"],
    "dueDate": "2023-12-31T23:59:59Z"
  }
  ```
- **Response**:
  - 200: `{ success: true, data: { task: Task } }`
  - 400: Invalid input
  - 404: Task not found
  - 401: Unauthorized
  - 500: Internal server error

### 5. Delete Task
- **Method**: DELETE
- **Endpoint**: `/tasks/{id}`
- **Description**: Delete a task by its ID
- **Path Parameters**:
  - `id`: Task identifier
- **Response**:
  - 200: `{ success: true, data: { message: "Task deleted successfully" } }`
  - 404: Task not found
  - 401: Unauthorized
  - 500: Internal server error

### 6. Update Task Status
- **Method**: PATCH
- **Endpoint**: `/tasks/{id}/status`
- **Description**: Update only the status of a task
- **Path Parameters**:
  - `id`: Task identifier
- **Request Body**:
  ```
  {
    "status": "completed"
  }
  ```
- **Response**:
  - 200: `{ success: true, data: { task: Task } }`
  - 400: Invalid status
  - 404: Task not found
  - 401: Unauthorized
  - 500: Internal server error

### 7. Get User Profile
- **Method**: GET
- **Endpoint**: `/users/profile`
- **Description**: Retrieve the current user's profile information
- **Response**:
  - 200: `{ success: true, data: { user: User } }`
  - 401: Unauthorized
  - 500: Internal server error

### 8. Update User Preferences
- **Method**: PUT
- **Endpoint**: `/users/preferences`
- **Description**: Update user preferences
- **Request Body**:
  ```
  {
    "theme": "dark",
    "notificationsEnabled": true,
    "language": "en"
  }
  ```
- **Response**:
  - 200: `{ success: true, data: { user: User } }`
  - 400: Invalid input
  - 401: Unauthorized
  - 500: Internal server error

### 9. User Authentication
- **Method**: POST
- **Endpoint**: `/auth/login`
- **Description**: Authenticate user and return JWT token
- **Request Body**:
  ```
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**:
  - 200: `{ success: true, data: { token: "jwt_token_here", user: User } }`
  - 401: Invalid credentials
  - 500: Internal server error

### 10. User Registration
- **Method**: POST
- **Endpoint**: `/auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**:
  - 201: `{ success: true, data: { token: "jwt_token_here", user: User } }`
  - 400: Invalid input
  - 409: User already exists
  - 500: Internal server error

## Error Response Format
All error responses follow this format:
```
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message for this field"
    }
  ]
}
```

## Authentication
Most endpoints require authentication via a Bearer token in the Authorization header. The frontend should handle token refresh and unauthorized responses gracefully.