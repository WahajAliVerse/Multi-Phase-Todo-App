# Data Model: AI Task Assistant

## Core Entities

### 1. AI Agent

**Purpose**: Main conversational interface that interprets user intents and orchestrates tool execution

**Attributes**:
- `id`: UUID - Unique identifier for agent instance
- `name`: String - "TodoAssistant"
- `model`: String - "gemini-1.5-flash"
- `instructions`: String - System instructions for behavior
- `created_at`: DateTime - Agent creation timestamp
- `updated_at`: DateTime - Last update timestamp

**Relationships**:
- Has many Chat Conversations
- Has many Tool Definitions (15 tools)

**State Transitions**:
- Initialize → Ready → Processing → Ready | Error

---

### 2. Chat Message

**Purpose**: Individual message in conversation history

**Attributes**:
- `id`: UUID - Unique message identifier
- `conversation_id`: UUID - Reference to conversation
- `role`: Enum - "user" | "assistant" | "system"
- `content`: String - Message text content
- `timestamp`: DateTime - Message creation time
- `status`: Enum - "sending" | "sent" | "failed" | "retrying"
- `metadata`: JSON - Additional context (intent, tool_calls, etc.)

**Relationships**:
- Belongs to one Chat Conversation
- Has many Tool Calls (for assistant messages)

**Validation Rules**:
- Content must not be empty for user/assistant roles
- Timestamp must be timezone-aware (UTC)
- Status must be valid enum value

---

### 3. Chat Conversation

**Purpose**: Persistent conversation session with message history

**Attributes**:
- `id`: UUID - Unique conversation identifier
- `user_id`: UUID - Reference to authenticated user
- `title`: String - Conversation title (auto-generated or user-set)
- `created_at`: DateTime - Conversation start time
- `updated_at`: DateTime - Last message time
- `is_active`: Boolean - Whether conversation is ongoing

**Relationships**:
- Belongs to one User
- Has many Chat Messages
- Has many Agent Actions

**State Transitions**:
- Created → Active → [Paused | Closed]

---

### 4. Agent Tool

**Purpose**: Callable function wrapper for backend API endpoints

**Attributes**:
- `id`: UUID - Unique tool identifier
- `name`: String - Tool name (e.g., "create_task", "update_task")
- `description`: String - Human-readable description
- `category`: Enum - "task" | "tag" | "recurrence" | "scheduling"
- `input_schema`: JSON - JSON Schema for input validation
- `output_schema`: JSON - JSON Schema for output validation
- `is_active`: Boolean - Whether tool is enabled

**Relationships**:
- Belongs to one AI Agent
- Has many Tool Executions

**Validation Rules**:
- Name must be unique within agent
- Input/output schemas must be valid JSON Schema
- Category must be valid enum value

---

### 5. Tool Execution

**Purpose**: Record of tool invocation with inputs, outputs, and status

**Attributes**:
- `id`: UUID - Unique execution identifier
- `tool_id`: UUID - Reference to tool
- `conversation_id`: UUID - Reference to conversation
- `input_data`: JSON - Tool input parameters
- `output_data`: JSON - Tool output/result
- `status`: Enum - "pending" | "success" | "failed" | "retried"
- `error_message`: String - Error details if failed
- `execution_time_ms`: Integer - Execution duration in milliseconds
- `created_at`: DateTime - Execution start time

**Relationships**:
- Belongs to one Agent Tool
- Belongs to one Chat Conversation

**Validation Rules**:
- Input/output must match tool's schema
- Execution time must be non-negative
- Status must be valid enum value

---

### 6. User Intent

**Purpose**: Parsed meaning extracted from natural language input

**Attributes**:
- `id`: UUID - Unique intent identifier
- `message_id`: UUID - Reference to source message
- `intent_type`: Enum - "create_task" | "update_task" | "delete_task" | "query_tasks" | "create_tag" | "assign_tag" | "create_recurring" | "schedule_reminder" | etc.
- `confidence`: Float - Confidence score (0.0 to 1.0)
- `extracted_entities`: JSON - Parsed entities (dates, priorities, tags, etc.)
- `requires_clarification`: Boolean - Whether MCP clarification needed
- `clarification_questions`: JSON - List of questions if clarification needed

**Relationships**:
- Belongs to one Chat Message
- Has many Tool Executions (resolved actions)

**Validation Rules**:
- Confidence must be between 0.0 and 1.0
- Intent type must be valid enum value
- If requires_clarification is true, clarification_questions must not be empty

---

### 7. Recurrence Pattern

**Purpose**: Structured representation of recurring schedule (mirrors backend schema)

**Attributes**:
- `id`: UUID - Unique pattern identifier
- `frequency`: Enum - "daily" | "weekly" | "monthly" | "yearly"
- `interval`: Integer - How often to repeat (every N days/weeks/etc.)
- `days_of_week`: JSON Array - ["mon", "wed", "fri"] for weekly patterns
- `day_of_month`: Integer - Day of month (1-31) for monthly patterns
- `end_condition`: Enum - "never" | "after" | "on_date"
- `end_after_occurrences`: Integer - Number of occurrences before stopping
- `end_date`: DateTime - Date to stop recurrence

**Relationships**:
- Referenced by Task (backend relationship)
- Created by create_recurring_task tool

**Validation Rules**:
- Frequency must be valid enum value
- Interval must be >= 1
- days_of_week must contain valid day abbreviations
- day_of_month must be 1-31
- If end_condition is "after", end_after_occurrences must be set
- If end_condition is "on_date", end_date must be set

---

### 8. Reminder

**Purpose**: Scheduled notification for task (mirrors backend schema)

**Attributes**:
- `id`: UUID - Unique reminder identifier
- `task_id`: UUID - Reference to task
- `reminder_time`: DateTime - When to trigger reminder
- `delivery_method`: Enum - "browser" | "email" | "push"
- `message`: String - Reminder message text
- `is_triggered`: Boolean - Whether reminder has been sent
- `triggered_at`: DateTime - When reminder was triggered

**Relationships**:
- Belongs to one Task
- Created by schedule_task_reminder tool

**Validation Rules**:
- reminder_time must be in the future
- delivery_method must be valid enum value
- triggered_at must be null or >= reminder_time

---

## Entity Relationship Diagram

```
User (1) ─────< Chat Conversation (N)
                          │
                          │ (1)
                          │
                          │
                    Chat Message (N)
                          │
                          │ (1)
                          │
                          │
                    User Intent (1)
                          │
              ┌───────────┼───────────┐
              │           │           │
              │           │           │
    Tool Execution (N)  (MCP)   Clarification (N)
              │
              │
              │
        Agent Tool (1)
              │
              │
              │
         AI Agent (1)
```

---

## State Machines

### Chat Message Lifecycle

```
[sending] ──→ [sent] ──→ (terminal)
    │            │
    │            │
    ↓            ↓
[failed] ──→ [retrying] ──→ [sent]
```

### Tool Execution Flow

```
[pending] ──→ [executing] ──→ [success]
    │              │
    │              │
    │              ↓
    │          [failed] ──→ [retried] ──→ [success]
    │              │
    │              │
    ↓              ↓
[error]        [error]
```

### User Intent Resolution

```
[received] ──→ [parsing] ──→ [needs_clarification] ──→ [clarified] ──→ [executing]
    │              │                                      │
    │              │                                      │
    ↓              ↓                                      ↓
[ambiguous]  [parsed]                              [ready_for_tools]
```

---

## Validation Rules Summary

### Chat Message Validation
- Content: Required for user/assistant, max 4000 characters
- Role: Must be "user", "assistant", or "system"
- Timestamp: Must be ISO 8601 format with timezone

### Tool Execution Validation
- Input data: Must match tool's input_schema
- Output data: Must match tool's output_schema (on success)
- Execution time: Must be >= 0
- Status transitions: Must follow valid state machine

### User Intent Validation
- Confidence: Must be 0.0 to 1.0
- Intent type: Must match supported operations
- Extracted entities: Must include required fields for intent type
- Clarification: If confidence < 0.8, requires_clarification should be true

---

## Data Persistence Strategy

### Development (SQLite)
- All entities stored in SQLite database
- Foreign key constraints enabled
- Automatic migrations via SQLModel

### Production (PostgreSQL)
- Migrate to PostgreSQL with same schema
- Add indexes on frequently queried fields:
  - `chat_message.conversation_id`
  - `tool_execution.tool_id`
  - `user_intent.message_id`
- Enable full-text search on `chat_message.content`

### Data Retention
- Chat conversations: Retain indefinitely (user can delete)
- Tool executions: Retain for 90 days for debugging
- User intents: Retain for 30 days for analytics

---

## Integration Points

### Backend Integration
- Recurrence Pattern: Mirrors backend `recurrencepattern` table
- Reminder: Mirrors backend `notification` table
- Task references: Use backend task UUIDs

### Frontend Integration
- Chat Message: Synced to Redux `agentChat` slice
- User Intent: Used for UI state management
- Tool Execution: Triggers Redux updates on success
