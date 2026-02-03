# API Contracts: Frontend Updates for Recurrence, Reminders, and Tags

## 1. Tag Endpoints

### GET /api/v1/tags
Retrieve all tags for the current user

**Request**:
- Headers: Authorization: Bearer {token}
- Query params: None

**Response**:
- 200: Array<Tag>
```json
[
  {
    "id": 1,
    "name": "Work",
    "color": "#FF5733",
    "userId": 123,
    "createdAt": "2026-02-03T10:00:00Z",
    "updatedAt": "2026-02-03T10:00:00Z"
  }
]
```

### POST /api/v1/tags
Create a new tag

**Request**:
- Headers: Authorization: Bearer {token}, Content-Type: application/json
- Body:
```json
{
  "name": "Personal",
  "color": "#33FF57"
}
```

**Response**:
- 201: Created Tag
```json
{
  "id": 2,
  "name": "Personal",
  "color": "#33FF57",
  "userId": 123,
  "createdAt": "2026-02-03T10:05:00Z"
}
```

### PUT /api/v1/tags/{tag_id}
Update an existing tag

**Request**:
- Headers: Authorization: Bearer {token}, Content-Type: application/json
- Params: tag_id (integer)
- Body:
```json
{
  "name": "Updated Personal",
  "color": "#3357FF"
}
```

**Response**:
- 200: Updated Tag
```json
{
  "id": 2,
  "name": "Updated Personal",
  "color": "#3357FF",
  "userId": 123,
  "createdAt": "2026-02-03T10:05:00Z",
  "updatedAt": "2026-02-03T10:10:00Z"
}
```

### DELETE /api/v1/tags/{tag_id}
Delete a tag

**Request**:
- Headers: Authorization: Bearer {token}
- Params: tag_id (integer)

**Response**:
- 204: No Content

## 2. Recurrence Pattern Endpoints

### POST /api/v1/recurrence-patterns
Create a recurrence pattern

**Request**:
- Headers: Authorization: Bearer {token}, Content-Type: application/json
- Body:
```json
{
  "patternType": "weekly",
  "interval": 1,
  "endCondition": "after_occurrences",
  "occurrenceCount": 10,
  "daysOfWeek": ["mon", "wed", "fri"]
}
```

**Response**:
- 201: Created RecurrencePattern
```json
{
  "id": 1,
  "patternType": "weekly",
  "interval": 1,
  "endCondition": "after_occurrences",
  "occurrenceCount": 10,
  "daysOfWeek": ["mon", "wed", "fri"],
  "createdAt": "2026-02-03T10:15:00Z"
}
```

## 3. Reminder Endpoints

### POST /api/v1/reminders
Create a reminder

**Request**:
- Headers: Authorization: Bearer {token}, Content-Type: application/json
- Body:
```json
{
  "taskId": 5,
  "scheduledTime": "2026-02-04T09:00:00Z"
}
```

**Response**:
- 201: Created Reminder
```json
{
  "id": 1,
  "taskId": 5,
  "scheduledTime": "2026-02-04T09:00:00Z",
  "deliveryStatus": "pending",
  "createdAt": "2026-02-03T10:20:00Z"
}
```

## 4. Extended Task Endpoints

### GET /api/v1/tasks
Retrieve tasks with optional filtering by tags, recurrence, and reminders

**Request**:
- Headers: Authorization: Bearer {token}
- Query params: 
  - tagIds: comma-separated list of tag IDs
  - includeRecurrence: boolean
  - includeReminders: boolean

**Response**:
- 200: Array<Task>
```json
[
  {
    "id": 1,
    "title": "Weekly Meeting",
    "description": "Team sync meeting",
    "status": "active",
    "priority": "medium",
    "dueDate": "2026-02-04T09:00:00Z",
    "createdAt": "2026-02-03T08:00:00Z",
    "updatedAt": "2026-02-03T08:00:00Z",
    "userId": 123,
    "tags": [
      {
        "id": 1,
        "name": "Work",
        "color": "#FF5733",
        "userId": 123,
        "createdAt": "2026-02-03T10:00:00Z"
      }
    ],
    "recurrencePattern": {
      "id": 1,
      "patternType": "weekly",
      "interval": 1,
      "endCondition": "after_occurrences",
      "occurrenceCount": 10,
      "daysOfWeek": ["mon", "wed", "fri"],
      "createdAt": "2026-02-03T10:15:00Z"
    },
    "reminders": [
      {
        "id": 1,
        "taskId": 1,
        "scheduledTime": "2026-02-04T08:00:00Z",
        "deliveryStatus": "pending",
        "createdAt": "2026-02-03T10:20:00Z"
      }
    ]
  }
]
```

### POST /api/v1/tasks
Create a task with optional tags, recurrence pattern, and reminders

**Request**:
- Headers: Authorization: Bearer {token}, Content-Type: application/json
- Body:
```json
{
  "title": "Weekly Meeting",
  "description": "Team sync meeting",
  "status": "active",
  "priority": "medium",
  "dueDate": "2026-02-04T09:00:00Z",
  "tagIds": [1],
  "recurrencePattern": {
    "patternType": "weekly",
    "interval": 1,
    "endCondition": "after_occurrences",
    "occurrenceCount": 10,
    "daysOfWeek": ["mon", "wed", "fri"]
  },
  "reminders": [
    {
      "scheduledTime": "2026-02-04T08:00:00Z"
    }
  ]
}
```

**Response**:
- 201: Created Task
```json
{
  "id": 1,
  "title": "Weekly Meeting",
  "description": "Team sync meeting",
  "status": "active",
  "priority": "medium",
  "dueDate": "2026-02-04T09:00:00Z",
  "createdAt": "2026-02-03T08:00:00Z",
  "updatedAt": "2026-02-03T08:00:00Z",
  "userId": 123,
  "tags": [
    {
      "id": 1,
      "name": "Work",
      "color": "#FF5733",
      "userId": 123,
      "createdAt": "2026-02-03T10:00:00Z"
    }
  ],
  "recurrencePattern": {
    "id": 1,
    "patternType": "weekly",
    "interval": 1,
    "endCondition": "after_occurrences",
    "occurrenceCount": 10,
    "daysOfWeek": ["mon", "wed", "fri"],
    "createdAt": "2026-02-03T10:15:00Z"
  },
  "reminders": [
    {
      "id": 1,
      "taskId": 1,
      "scheduledTime": "2026-02-04T08:00:00Z",
      "deliveryStatus": "pending",
      "createdAt": "2026-02-03T10:20:00Z"
    }
  ]
}
```

### PUT /api/v1/tasks/{task_id}
Update a task with optional updates to tags, recurrence pattern, and reminders

**Request**:
- Headers: Authorization: Bearer {token}, Content-Type: application/json
- Params: task_id (integer)
- Body: (partial updates allowed)
```json
{
  "title": "Updated Weekly Meeting",
  "tagIds": [1, 2],
  "recurrencePattern": {
    "patternType": "weekly",
    "interval": 2,
    "endCondition": "on_date",
    "endDate": "2026-12-31T00:00:00Z"
  }
}
```

**Response**:
- 200: Updated Task
```json
{
  "id": 1,
  "title": "Updated Weekly Meeting",
  "description": "Team sync meeting",
  "status": "active",
  "priority": "medium",
  "dueDate": "2026-02-04T09:00:00Z",
  "createdAt": "2026-02-03T08:00:00Z",
  "updatedAt": "2026-02-03T10:30:00Z",
  "userId": 123,
  "tags": [
    {
      "id": 1,
      "name": "Work",
      "color": "#FF5733",
      "userId": 123,
      "createdAt": "2026-02-03T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Meeting",
      "color": "#33FF57",
      "userId": 123,
      "createdAt": "2026-02-03T10:05:00Z"
    }
  ],
  "recurrencePattern": {
    "id": 1,
    "patternType": "weekly",
    "interval": 2,
    "endCondition": "on_date",
    "endDate": "2026-12-31T00:00:00Z",
    "createdAt": "2026-02-03T10:15:00Z",
    "updatedAt": "2026-02-03T10:30:00Z"
  },
  "reminders": [
    {
      "id": 1,
      "taskId": 1,
      "scheduledTime": "2026-02-04T08:00:00Z",
      "deliveryStatus": "pending",
      "createdAt": "2026-02-03T10:20:00Z"
    }
  ]
}
```