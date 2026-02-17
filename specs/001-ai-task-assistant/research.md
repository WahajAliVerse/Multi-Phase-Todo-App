# Phase 0 Research: AI Task Assistant Integration

## Research Questions & Findings

### 1. Google Gemini Integration with OpenAI Agents SDK

**Decision**: Use Google Gemini 1.5 Flash via OpenAI-compatible endpoint

**Rationale**:
- Gemini 1.5 Flash provides excellent performance for task management NLP
- OpenAI Agents SDK compatibility allows using familiar patterns
- Cost-effective for production use with high token limits
- Supports function calling for tool invocation

**Alternatives Considered**:
- Gemini 2.0 Pro: More powerful but overkill for task management, higher cost
- Claude 3.5 Sonnet: Excellent but requires different SDK, violates "Gemini exclusively" constraint
- GPT-4o: Violates constraint of using Google Gemini exclusively

**Implementation Pattern**:
```python
from openai import AsyncOpenAI
from agents import Agent, Runner, RunConfig
from agents.models import OpenAIChatCompletionsModel

# Initialize with Gemini endpoint
external_client = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

model = OpenAIChatCompletionsModel(
    model="gemini-1.5-flash",
    openai_client=external_client
)
```

---

### 2. Multi-Context Provider (MCP) Integration Pattern

**Decision**: Implement MCP as analysis-only layer before tool execution

**Rationale**:
- MCP provides reasoning for ambiguous scenarios without executing actions
- Separates analysis from execution (clean architecture)
- Enables clarification before destructive actions
- Aligns with LEARN → THINK → ACT principle

**Integration Points**:
1. **Ambiguous task references**: "Mark the meeting as complete" (multiple meetings exist)
2. **Unclear dates**: "Next week" (which day?)
3. **Conflicting intents**: "Delete all tasks" (destructive, needs confirmation)
4. **Parsing failures**: Unrecognized date formats or recurrence patterns

**Implementation Pattern**:
```python
async def analyze_with_mcp(user_input: str, context: dict) -> MCPResult:
    """Use MCP for reasoning before tool invocation"""
    # MCP analyzes intent, identifies ambiguities
    # Returns clarification questions or recommended action
    # NEVER executes tools directly
    pass

async def execute_with_clarification(user_input: str):
    """Main flow: MCP analysis → clarification (if needed) → tool execution"""
    analysis = await analyze_with_mcp(user_input, context)
    
    if analysis.needs_clarification:
        questions = analysis.get_clarification_questions()
        user_response = await ask_user(questions)
        refined_input = refine_with_clarifications(user_input, user_response)
    else:
        refined_input = user_input
    
    # Now execute tools with clarified intent
    return await execute_tools(refined_input)
```

---

### 3. Natural Language Date/Time Parsing

**Decision**: Use `dateutil` library with custom extensions for recurrence patterns

**Rationale**:
- Handles relative references ("tomorrow", "next week", "in 2 hours")
- Timezone-aware parsing
- Extensible for custom recurrence patterns
- Well-maintained and production-tested

**Pattern Support**:
- Absolute: "2026-02-20 at 3pm", "next Monday at 10am"
- Relative: "tomorrow", "in 2 hours", "next week"
- Recurrence: "every Monday", "daily for 10 days", "monthly on the 1st"
- Reminders: "30 minutes before", "1 day before", "at start time"

**Implementation Pattern**:
```python
from dateutil import parser
from dateutil.relativedelta import relativedelta

def parse_datetime(expression: str, reference: datetime = None) -> datetime:
    """Parse natural language datetime expression"""
    reference = reference or datetime.now()
    
    # Handle relative expressions
    if "in" in expression and ("hour" in expression or "day" in expression or "week" in expression):
        # Parse "in 2 hours", "in 3 days", etc.
        ...
    elif "next" in expression:
        # Parse "next Monday", "next week", etc.
        ...
    else:
        # Standard parsing
        return parser.parse(expression, fuzzy=True)
```

---

### 4. Backend API Tool Wrapping Pattern

**Decision**: Create tool wrapper functions with consistent error handling and logging

**Rationale**:
- Preserves backend READ-ONLY constraint
- Provides consistent interface for agent
- Centralizes error handling and retry logic
- Enables comprehensive logging for debugging

**Tool Structure**:
```python
from typing import Optional, List
from sqlmodel import Session
from src.core.database import get_session

class TaskTools:
    """Tool wrappers for task management backend APIs"""
    
    @staticmethod
    async def create_task(
        title: str,
        description: Optional[str] = None,
        due_date: Optional[datetime] = None,
        priority: str = "medium",
        tags: Optional[List[str]] = None
    ) -> dict:
        """Create a new task via backend API"""
        try:
            session = get_session()
            # Call existing backend service
            task = TaskService().create_task(session, TaskCreate(...))
            return {"success": True, "task_id": str(task.id), "task": task.dict()}
        except Exception as e:
            logger.error(f"Failed to create task: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def update_task(
        task_id: str,
        updates: dict
    ) -> dict:
        """Update existing task via backend API"""
        ...
    
    # Similar patterns for: delete_task, get_tasks, mark_task_complete
```

---

### 5. Redux State Synchronization Pattern

**Decision**: Implement optimistic updates with rollback on failure

**Rationale**:
- Provides instant UI feedback (<1s sync requirement)
- Maintains Redux state integrity
- Handles API failures gracefully
- Aligns with existing Redux patterns in application

**Implementation Pattern**:
```typescript
// Redux slice for agent chat
const agentChatSlice = createSlice({
  name: 'agentChat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (state, action) => {
      // Update message status (sending, sent, failed)
    },
  },
  extraReducers: (builder) => {
    builder
      // On successful task creation via chat
      .addCase(createTask.fulfilled, (state, action) => {
        // Sync to tasks slice
        state.lastAction = { type: 'create_task', taskId: action.payload.id };
      })
      // On failure
      .addCase(createTask.rejected, (state, action) => {
        // Show error, maintain state integrity
        state.error = action.payload;
      });
  },
});
```

---

### 6. Rate Limiting Pattern for Agent Endpoint

**Decision**: Implement token bucket rate limiting per user session

**Rationale**:
- Prevents abuse of LLM API (cost control)
- Ensures fair usage across concurrent users
- Aligns with constitution security principle
- Configurable limits based on user tier

**Implementation Pattern**:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/chat")
@limiter.limit("10/minute")  # 10 requests per minute per user
async def chat_endpoint(request: Request, message: ChatMessage):
    """Chat endpoint with rate limiting"""
    # Process message
    pass
```

---

### 7. Error Handling and Retry Strategy

**Decision**: Implement exponential backoff with jitter for transient failures

**Rationale**:
- Handles transient API failures gracefully
- Prevents thundering herd on retry
- Provides user-friendly fallback messages
- Maintains Redux state integrity during errors

**Implementation Pattern**:
```python
import asyncio
import random

async def retry_with_backoff(func, max_retries=3, base_delay=1.0):
    """Retry with exponential backoff and jitter"""
    for attempt in range(max_retries):
        try:
            return await func()
        except TransientError as e:
            if attempt == max_retries - 1:
                raise
            
            delay = base_delay * (2 ** attempt) + random.uniform(0, 0.1)
            logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay:.1f}s")
            await asyncio.sleep(delay)
```

---

## Technology Choices Summary

| Component | Choice | Rationale |
|-----------|--------|-----------|
| LLM Provider | Google Gemini 1.5 Flash | Constraint compliance, cost-effective, excellent NLP |
| SDK | OpenAI Agents SDK | Compatibility layer, familiar patterns |
| Date Parsing | `dateutil` | Production-tested, timezone-aware, extensible |
| Rate Limiting | `slowapi` | FastAPI integration, per-user limits |
| State Management | Redux Toolkit | Existing application pattern, optimistic updates |
| Error Handling | Exponential backoff + jitter | Industry standard, prevents thundering herd |

---

## Next Steps

1. **Phase 1**: Generate data-model.md with AI Agent entities
2. **Phase 1**: Create API contracts for chat endpoint and tools
3. **Phase 1**: Generate quickstart.md with Gemini setup guide
4. **Phase 1**: Update agent context with new technologies
5. **Re-check Constitution Check** post-design
