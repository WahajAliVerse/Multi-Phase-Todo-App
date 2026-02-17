# API Contracts: AI Task Assistant

## Chat Endpoint

### POST /api/chat

**Description**: Main chat endpoint for AI agent interactions

**Request Body**:
```json
{
  "message": {
    "type": "string",
    "maxLength": 4000,
    "description": "User's natural language message"
  },
  "conversation_id": {
    "type": "string",
    "format": "uuid",
    "description": "Existing conversation ID or null for new conversation"
  }
}
```

**Response**:
```json
{
  "success": {
    "type": "boolean"
  },
  "message": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "format": "uuid" },
      "conversation_id": { "type": "string", "format": "uuid" },
      "role": { "type": "string", "enum": ["user", "assistant"] },
      "content": { "type": "string" },
      "timestamp": { "type": "string", "format": "date-time" }
    }
  },
  "action": {
    "type": "object",
    "properties": {
      "type": { "type": "string" },
      "task_id": { "type": "string", "format": "uuid" },
      "details": { "type": "object" }
    }
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

**Rate Limiting**: 10 requests per minute per user session

---

## Agent Tool Contracts

### Task Management Tools

#### create_task

**Input Schema**:
```json
{
  "title": { "type": "string", "minLength": 1, "maxLength": 200 },
  "description": { "type": "string", "maxLength": 1000 },
  "due_date": { "type": "string", "format": "date-time" },
  "priority": { "type": "string", "enum": ["low", "medium", "high"] },
  "tags": { "type": "array", "items": { "type": "string", "format": "uuid" } }
}
```

**Output Schema**:
```json
{
  "success": { "type": "boolean" },
  "task_id": { "type": "string", "format": "uuid" },
  "task": { "$ref": "#/definitions/Task" }
}
```

#### update_task

**Input Schema**:
```json
{
  "task_id": { "type": "string", "format": "uuid" },
  "updates": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "description": { "type": "string" },
      "due_date": { "type": "string", "format": "date-time" },
      "priority": { "type": "string", "enum": ["low", "medium", "high"] },
      "status": { "type": "string", "enum": ["pending", "in_progress", "completed"] }
    }
  }
}
```

**Output Schema**: Same as create_task

#### delete_task

**Input Schema**:
```json
{
  "task_id": { "type": "string", "format": "uuid" }
}
```

**Output Schema**:
```json
{
  "success": { "type": "boolean" },
  "message": { "type": "string" }
}
```

#### get_tasks

**Input Schema**:
```json
{
  "filters": {
    "type": "object",
    "properties": {
      "status": { "type": "string", "enum": ["all", "active", "completed"] },
      "priority": { "type": "string", "enum": ["all", "low", "medium", "high"] },
      "tag_ids": { "type": "array", "items": { "type": "string", "format": "uuid" } },
      "search": { "type": "string" },
      "date_from": { "type": "string", "format": "date-time" },
      "date_to": { "type": "string", "format": "date-time" }
    }
  }
}
```

**Output Schema**:
```json
{
  "success": { "type": "boolean" },
  "tasks": { "type": "array", "items": { "$ref": "#/definitions/Task" } },
  "count": { "type": "integer" }
}
```

#### mark_task_complete

**Input Schema**:
```json
{
  "task_id": { "type": "string", "format": "uuid" }
}
```

**Output Schema**: Same as update_task

---

### Tag Management Tools

#### create_tag

**Input Schema**:
```json
{
  "name": { "type": "string", "minLength": 1, "maxLength": 50 },
  "color": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" }
}
```

**Output Schema**:
```json
{
  "success": { "type": "boolean" },
  "tag_id": { "type": "string", "format": "uuid" },
  "tag": { "$ref": "#/definitions/Tag" }
}
```

#### update_tag

**Input Schema**:
```json
{
  "tag_id": { "type": "string", "format": "uuid" },
  "updates": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "color": { "type": "string" }
    }
  }
}
```

**Output Schema**: Same as create_tag

#### delete_tag

**Input Schema**:
```json
{
  "tag_id": { "type": "string", "format": "uuid" }
}
```

**Output Schema**: Same as delete_task

#### get_tags

**Input Schema**: `{}` (no parameters)

**Output Schema**:
```json
{
  "success": { "type": "boolean" },
  "tags": { "type": "array", "items": { "$ref": "#/definitions/Tag" } }
}
```

#### assign_tag_to_task

**Input Schema**:
```json
{
  "tag_id": { "type": "string", "format": "uuid" },
  "task_id": { "type": "string", "format": "uuid" }
}
```

**Output Schema**:
```json
{
  "success": { "type": "boolean" },
  "message": { "type": "string" }
}
```

---

### Recurrence & Scheduling Tools

#### create_recurring_task

**Input Schema**:
```json
{
  "task_id": { "type": "string", "format": "uuid" },
  "pattern": {
    "type": "object",
    "properties": {
      "frequency": { "type": "string", "enum": ["daily", "weekly", "monthly", "yearly"] },
      "interval": { "type": "integer", "minimum": 1 },
      "days_of_week": { "type": "array", "items": { "type": "string", "enum": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] } },
      "day_of_month": { "type": "integer", "minimum": 1, "maximum": 31 },
      "end_condition": { "type": "string", "enum": ["never", "after", "on_date"] },
      "end_after_occurrences": { "type": "integer", "minimum": 1 },
      "end_date": { "type": "string", "format": "date-time" }
    }
  }
}
```

**Output Schema**:
```json
{
  "success": { "type": "boolean" },
  "recurrence_id": { "type": "string", "format": "uuid" },
  "pattern": { "$ref": "#/definitions/RecurrencePattern" }
}
```

#### update_recurrence_pattern

**Input Schema**:
```json
{
  "recurrence_id": { "type": "string", "format": "uuid" },
  "new_pattern": {
    "type": "object",
    "properties": {
      "frequency": { "type": "string" },
      "interval": { "type": "integer" },
      "days_of_week": { "type": "array" },
      "day_of_month": { "type": "integer" },
      "end_condition": { "type": "string" },
      "end_after_occurrences": { "type": "integer" },
      "end_date": { "type": "string" }
    }
  }
}
```

**Output Schema**: Same as create_recurring_task

#### cancel_recurrence

**Input Schema**:
```json
{
  "recurrence_id": { "type": "string", "format": "uuid" }
}
```

**Output Schema**: Same as delete_task

#### generate_next_occurrence

**Input Schema**:
```json
{
  "recurrence_id": { "type": "string", "format": "uuid" }
}
```

**Output Schema**: Same as create_task

#### schedule_task_reminder

**Input Schema**:
```json
{
  "task_id": { "type": "string", "format": "uuid" },
  "reminder_time": { "type": "string", "format": "date-time" },
  "delivery_method": { "type": "string", "enum": ["browser", "email", "push"] },
  "message": { "type": "string" }
}
```

**Output Schema**:
```json
{
  "success": { "type": "boolean" },
  "reminder_id": { "type": "string", "format": "uuid" },
  "reminder": { "$ref": "#/definitions/Reminder" }
}
```

---

## Data Definitions

### Task

```json
{
  "id": { "type": "string", "format": "uuid" },
  "title": { "type": "string" },
  "description": { "type": "string" },
  "status": { "type": "string", "enum": ["pending", "in_progress", "completed"] },
  "priority": { "type": "string", "enum": ["low", "medium", "high"] },
  "due_date": { "type": "string", "format": "date-time" },
  "completed_at": { "type": "string", "format": "date-time" },
  "user_id": { "type": "string", "format": "uuid" },
  "tags": { "type": "array", "items": { "type": "string", "format": "uuid" } },
  "recurrence_pattern_id": { "type": "string", "format": "uuid" },
  "created_at": { "type": "string", "format": "date-time" },
  "updated_at": { "type": "string", "format": "date-time" }
}
```

### Tag

```json
{
  "id": { "type": "string", "format": "uuid" },
  "name": { "type": "string" },
  "color": { "type": "string" },
  "user_id": { "type": "string", "format": "uuid" },
  "created_at": { "type": "string", "format": "date-time" },
  "updated_at": { "type": "string", "format": "date-time" }
}
```

### RecurrencePattern

```json
{
  "id": { "type": "string", "format": "uuid" },
  "frequency": { "type": "string", "enum": ["daily", "weekly", "monthly", "yearly"] },
  "interval": { "type": "integer" },
  "days_of_week": { "type": "array", "items": { "type": "string" } },
  "day_of_month": { "type": "integer" },
  "end_condition": { "type": "string", "enum": ["never", "after", "on_date"] },
  "end_after_occurrences": { "type": "integer" },
  "end_date": { "type": "string", "format": "date-time" },
  "created_at": { "type": "string", "format": "date-time" },
  "updated_at": { "type": "string", "format": "date-time" }
}
```

### Reminder

```json
{
  "id": { "type": "string", "format": "uuid" },
  "task_id": { "type": "string", "format": "uuid" },
  "reminder_time": { "type": "string", "format": "date-time" },
  "delivery_method": { "type": "string", "enum": ["browser", "email", "push"] },
  "message": { "type": "string" },
  "is_triggered": { "type": "boolean" },
  "triggered_at": { "type": "string", "format": "date-time" },
  "created_at": { "type": "string", "format": "date-time" },
  "updated_at": { "type": "string", "format": "date-time" }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Request body doesn't match schema |
| `TASK_NOT_FOUND` | 404 | Task ID doesn't exist |
| `TAG_NOT_FOUND` | 404 | Tag ID doesn't exist |
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User doesn't own this resource |
| `RATE_LIMITED` | 429 | Too many requests |
| `LLM_ERROR` | 500 | Gemini API error |
| `BACKEND_ERROR` | 500 | Backend API error |
| `CLARIFICATION_NEEDED` | 400 | Intent ambiguous, needs clarification |
