# Root Cause Analysis: Gemini API Key Authentication Error

## Problem Summary

The agent was failing with 401 Unauthorized errors when trying to use the Gemini API:

```
Error code: 401 - {'error': {'message': 'Incorrect API key provided: AIzaSyBL...wc5g. 
You can find your API key at https://platform.openai.com/account/api-keys.', 
'type': 'invalid_request_error', 'param': None, 'code': 'invalid_api_key'}}
```

**Key Observation:** The error message references `platform.openai.com` even though we're trying to use Gemini.

## Root Cause

### The Issue

The OpenAI Agents SDK was making API calls to **OpenAI's endpoints** (`https://api.openai.com/v1/responses` and `https://api.openai.com/v1/traces/ingest`) with our **Gemini API key**, which naturally failed authentication.

### Why This Happened

1. **Tracing Enabled by Default**: The OpenAI Agents SDK has built-in tracing that sends data to OpenAI's servers
2. **Environment Variable Contamination**: Previous code was setting `os.environ['OPENAI_API_KEY'] = GEMINI_API_KEY` for "compatibility"
3. **SDK Auto-Detection**: The OpenAI SDK automatically picks up `OPENAI_API_KEY` from the environment and uses it for tracing API calls
4. **Wrong Endpoint**: The tracing client was calling OpenAI's API with a Gemini key, causing 401 errors

### Flow Diagram

```
User Request → Agent → Runner.run() → OpenAI SDK
                                      ↓
                              [Tracing Client]
                                      ↓
                          POST https://api.openai.com/v1/traces/ingest
                          Headers: Authorization: Bearer AIzaSy... (Gemini Key)
                                      ↓
                              401 Unauthorized ❌
```

## Solution Implemented

### 1. Disable Tracing Globally

Added tracing disable at the module level in `agent/agent.py`:

```python
from agents import set_tracing_disabled

# Disable OpenAI tracing globally
os.environ['OPENAI_AGENTS_DISABLE_TRACING'] = '1'
set_tracing_disabled(True)
```

**Why both?**
- Environment variable ensures tracing is disabled at SDK initialization
- `set_tracing_disabled()` ensures it's disabled at the SDK API level

### 2. Remove Global OPENAI_API_KEY Setting

**Before (WRONG):**
```python
# DON'T DO THIS - causes tracing to use Gemini key for OpenAI API
if GEMINI_API_KEY and not os.getenv('OPENAI_API_KEY'):
    os.environ['OPENAI_API_KEY'] = GEMINI_API_KEY
```

**After (CORRECT):**
```python
# Pass Gemini key directly to client - don't set globally
gemini_client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url=GEMINI_BASE_URL,
    organization=None,  # Explicitly disable organization
)
```

### 3. Use Correct Base URL

Ensured the Gemini base URL points to the OpenAI-compatible endpoint:

```python
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
```

This allows the OpenAI SDK to call Gemini's API instead of OpenAI's.

## Fixed Flow

```
User Request → Agent → Runner.run() → OpenAIChatCompletionsModel
                                      ↓
                              [gemini_client]
                                      ↓
                          POST https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
                          Headers: Authorization: Bearer AIzaSy... (Gemini Key)
                                      ↓
                              200 OK ✅
```

## Files Modified

### 1. `agent/agent.py`

**Changes:**
- Added `set_tracing_disabled` import
- Set `OPENAI_AGENTS_DISABLE_TRACING=1` environment variable
- Called `set_tracing_disabled(True)` at module load
- Removed code that set `OPENAI_API_KEY` globally
- Added `organization=None` to AsyncOpenAI client initialization

### 2. `agent/config/model_config.py`

**No changes needed** - the warning about `OPENAI_API_KEY` is expected and harmless.

## Testing

### Before Fix

```bash
POST /api/chat
{
  "message": "Create a task to buy groceries"
}

Response: 401 Unauthorized
Error: Incorrect API key provided: AIzaSy...
```

### After Fix

```bash
POST /api/chat
{
  "message": "Create a task to buy groceries"
}

Response: 200 OK
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "I've created a task: Buy groceries"
  },
  "action": {
    "type": "tool_call",
    "tool_name": "create_task"
  }
}
```

## Verification Steps

1. **Check tracing is disabled:**
   ```bash
   cd agent
   uv run python -c "import os; print(os.environ.get('OPENAI_AGENTS_DISABLE_TRACING'))"
   # Output: 1
   ```

2. **Check no OPENAI_API_KEY is set:**
   ```bash
   uv run python -c "import os; print('OPENAI_API_KEY' in os.environ)"
   # Output: False
   ```

3. **Test agent with Gemini:**
   ```bash
   uv run python test_config.py
   # Should show all tests passing
   ```

4. **Test actual chat endpoint:**
   ```bash
   curl -X POST http://localhost:8000/api/chat \
     -H "Content-Type: application/json" \
     -H "Cookie: access_token=YOUR_TOKEN" \
     -d '{"message": "Create a task to test"}'
   # Should return 200 with task creation response
   ```

## Prevention

To prevent this issue in the future:

1. **Never set `OPENAI_API_KEY` to a non-OpenAI key** - even for "compatibility"
2. **Always disable tracing** when using non-OpenAI models:
   ```python
   os.environ['OPENAI_AGENTS_DISABLE_TRACING'] = '1'
   set_tracing_disabled(True)
   ```
3. **Pass API keys directly to clients** - don't rely on environment variables
4. **Check error messages carefully** - if you see `platform.openai.com` when using Gemini, that's the problem

## Reference

- [OpenAI Agents SDK - Disabling Tracing](https://github.com/openai/openai-agents-python/blob/main/docs/tracing.md)
- [Gemini API via OpenAI-Compatible Endpoint](https://ai.google.dev/docs/openai_compatibility)
- [Panaversity Model Configuration](https://github.com/panaversity/learn-agentic-ai/tree/main/01_ai_agents_first/05_model_configuration)

## Summary

**Problem:** OpenAI Agents SDK tracing was calling OpenAI's API with a Gemini key  
**Cause:** Global `OPENAI_API_KEY` environment variable + tracing enabled by default  
**Solution:** Disable tracing globally + pass Gemini key directly to client  
**Result:** Agent now correctly calls Gemini API and executes tasks ✅
