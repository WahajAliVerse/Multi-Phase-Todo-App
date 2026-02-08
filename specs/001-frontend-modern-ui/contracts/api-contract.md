# API Contract: Frontend Modern UI Upgrade

## Authentication Endpoints

### POST /auth/register
Register a new user account

**Request Body**:
```json
{
  "email": "string (required, valid email format)",
  "password": "string (required, min 8 chars)",
  "name": "string (optional, 1-50 chars)"
}
```

**Response (201)**:
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "createdAt": "ISO date string"
}
```

**Response (400)**:
```json
{
  "error": "string (validation error message)"
}
```

### POST /auth/login
Authenticate user and establish session

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200)**:
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**Response (401)**:
```json
{
  "error": "Invalid credentials"
}
```

### POST /auth/logout
Terminate user session

**Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/profile
Get current user profile

**Response (200)**:
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "preferences": {
    "theme": "light|dark"
  },
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### PUT /auth/profile
Update user profile

**Request Body**:
```json
{
  "name": "string (optional, 1-50 chars)",
  "preferences": {
    "theme": "light|dark"
  }
}
```

**Response (200)**:
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "preferences": {
    "theme": "light|dark"
  },
  "updatedAt": "ISO date string"
}
```

## Task Endpoints

### GET /tasks
Retrieve user's tasks with optional filtering

**Query Parameters**:
- status: "all|active|completed" (optional, default: "all")
- priority: "low|medium|high" (optional)
- tag: "string" (optional, tag ID)
- search: "string" (optional, search term)
- sort: "dueDate|priority|createdAt" (optional, default: "createdAt")
- order: "asc|desc" (optional, default: "desc")
- page: "number" (optional, default: 1)
- limit: "number" (optional, default: 20)

**Response (200)**:
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "completed": "boolean",
      "priority": "low|medium|high",
      "dueDate": "ISO date string (nullable)",
      "tags": ["string"],
      "userId": "string",
      "recurrence": {
        "pattern": "daily|weekly|monthly|yearly",
        "interval": "number"
      },
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

### POST /tasks
Create a new task

**Request Body**:
```json
{
  "title": "string (required, 1-100 chars)",
  "description": "string (optional)",
  "priority": "low|medium|high (default: medium)",
  "dueDate": "ISO date string (optional)",
  "tags": ["string (optional)"],
  "recurrence": {
    "pattern": "daily|weekly|monthly|yearly (optional)",
    "interval": "number (optional)"
  }
}
```

**Response (201)**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "completed": "false",
  "priority": "low|medium|high",
  "dueDate": "ISO date string (nullable)",
  "tags": ["string"],
  "userId": "string",
  "recurrence": {
    "pattern": "daily|weekly|monthly|yearly",
    "interval": "number"
  },
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### GET /tasks/{id}
Retrieve a specific task

**Response (200)**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "completed": "boolean",
  "priority": "low|medium|high",
  "dueDate": "ISO date string (nullable)",
  "tags": ["string"],
  "userId": "string",
  "recurrence": {
    "pattern": "daily|weekly|monthly|yearly",
    "interval": "number"
  },
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### PUT /tasks/{id}
Update a task

**Request Body**:
```json
{
  "title": "string (optional, 1-100 chars)",
  "description": "string (optional)",
  "completed": "boolean (optional)",
  "priority": "low|medium|high (optional)",
  "dueDate": "ISO date string (optional)",
  "tags": ["string (optional)"],
  "recurrence": {
    "pattern": "daily|weekly|monthly|yearly (optional)",
    "interval": "number (optional)"
  }
}
```

**Response (200)**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "completed": "boolean",
  "priority": "low|medium|high",
  "dueDate": "ISO date string (nullable)",
  "tags": ["string"],
  "userId": "string",
  "recurrence": {
    "pattern": "daily|weekly|monthly|yearly",
    "interval": "number"
  },
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### DELETE /tasks/{id}
Delete a task

**Response (200)**:
```json
{
  "message": "Task deleted successfully"
}
```

## Tag Endpoints

### GET /tags
Retrieve user's tags

**Response (200)**:
```json
{
  "tags": [
    {
      "id": "string",
      "name": "string",
      "color": "hex color string",
      "userId": "string",
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ]
}
```

### POST /tags
Create a new tag

**Request Body**:
```json
{
  "name": "string (required, 1-30 chars)",
  "color": "hex color string (optional, default: random color)"
}
```

**Response (201)**:
```json
{
  "id": "string",
  "name": "string",
  "color": "hex color string",
  "userId": "string",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### PUT /tags/{id}
Update a tag

**Request Body**:
```json
{
  "name": "string (optional, 1-30 chars)",
  "color": "hex color string (optional)"
}
```

**Response (200)**:
```json
{
  "id": "string",
  "name": "string",
  "color": "hex color string",
  "userId": "string",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### DELETE /tags/{id}
Delete a tag

**Response (200)**:
```json
{
  "message": "Tag deleted successfully"
}
```

## Reminder Endpoints

### GET /reminders/upcoming
Get upcoming reminders for the user

**Response (200)**:
```json
{
  "reminders": [
    {
      "id": "string",
      "taskId": "string",
      "taskTitle": "string",
      "dueDate": "ISO date string",
      "triggered": "boolean",
      "createdAt": "ISO date string"
    }
  ]
}
```