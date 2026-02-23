# ⚠️ CRITICAL ISSUE - Intent Parser Not Working with OpenRouter

## Current Status

**ALL chat API features are currently NON-FUNCTIONAL** due to intent parsing failures.

### The Problem

The `intent_parser_agent` in `agent/mcp/reasoning.py` is failing to parse user intents when using OpenRouter models. Every request falls back to clarification mode instead of executing the requested action.

### Root Cause

The OpenAI Agents SDK's `Runner.run()` with `output_type=AgentOutputSchema(IntentResult)` expects the model to output **strictly formatted JSON** matching the `IntentResult` Pydantic schema.

However, OpenRouter models (both Qwen3-14B and GPT-4.1-mini) are returning:
```
g.
{"intent_type": "query_tasks", "confidence": 0.9}
```

Instead of just:
```json
{"intent_type": "query_tasks", "confidence": 0.9}
```

The SDK tries to parse the entire response as JSON and fails, triggering the exception handler which returns a clarification request.

### What Was Tried

1. ✅ Configured OpenRouter with proper API key and base URL
2. ✅ Disabled OpenAI tracing
3. ✅ Fixed imports to work in backend context
4. ✅ Tried Qwen3-14B (worse JSON output)
5. ✅ Tried GPT-4.1-mini (better but still adds text before JSON)
6. ✅ Set `strict_json_schema=True` (didn't help)
7. ✅ Added explicit "output only JSON" instructions (didn't help)

### Why This Happens

The OpenAI Agents SDK's structured output feature works reliably with OpenAI models but is **not compatible** with most OpenRouter models because:
- OpenAI models are fine-tuned to follow the response format schema
- Other models (even GPT-4 via OpenRouter) don't follow it as strictly
- The SDK doesn't handle conversational text before/after JSON

## Current Configuration

```bash
MODEL_PROVIDER=openrouter
MODEL_NAME=openai/gpt-4.1-mini
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

## Impact

**ALL chat features are blocked:**
- ❌ Task creation via chat
- ❌ Task queries
- ❌ Task updates
- ❌ Task completion
- ❌ Tag management
- ❌ Reminders

Users only get: "I need a bit more information to help you accurately: 1. Could you provide more details about what you'd like to do?"

## Potential Solutions

### Solution 1: Use Direct OpenAI API (Recommended for Production)

Switch back to using OpenAI directly for the intent parser:

```python
# In agent/mcp/reasoning.py
from openai import AsyncOpenAI

# Use OpenAI directly for intent parsing
openai_client = AsyncOpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),  # Real OpenAI key
)

intent_parser_agent = Agent(
    name="IntentParser",
    model=OpenAIChatCompletionsModel(
        model="gpt-4.1-mini",
        openai_client=openai_client,
    ),
    # ... rest of config
)
```

**Pros:**
- ✅ Guaranteed to work with structured output
- ✅ Reliable intent parsing
- ✅ Production-ready

**Cons:**
- ❌ Requires OpenAI API key (not just OpenRouter)
- ❌ Two API providers to manage

### Solution 2: Remove Structured Output Requirement

Modify the intent parser to NOT use `output_type` and parse JSON manually:

```python
# Remove output_type parameter
intent_parser_agent = Agent(
    name="IntentParser",
    model=OpenAIChatCompletionsModel(...),
    instructions="...output JSON only..."
)

# In parse_intent function:
result = await Runner.run(intent_parser_agent, user_message)
# Manually extract and parse JSON from result.final_output
import re
json_match = re.search(r'\{.*\}', result.final_output, re.DOTALL)
if json_match:
    intent_dict = json.loads(json_match.group())
    # Convert to IntentResult
```

**Pros:**
- ✅ Works with any model
- ✅ More flexible
- ✅ Only needs OpenRouter

**Cons:**
- ❌ Requires significant code changes
- ❌ Less type safety
- ❌ May have parsing edge cases

### Solution 3: Use LiteLLM with Fallback

Configure LiteLLM to use OpenRouter with automatic fallback to OpenAI:

```bash
uv sync --extra litellm
```

```python
from agents.extensions.models.litellm_model import LitellmModel

intent_parser_agent = Agent(
    name="IntentParser",
    model=LitellmModel(
        model="openrouter/openai/gpt-4.1-mini",
        api_key=os.getenv('OPENROUTER_API_KEY'),
    ),
)
```

**Pros:**
- ✅ Unified interface
- ✅ Automatic fallbacks

**Cons:**
- ❌ Additional dependency
- ❌ Still may have JSON issues
- ❌ More complex configuration

## Recommended Next Steps

### Immediate (Get It Working)

1. **Get an OpenAI API key** from https://platform.openai.com/api-keys
2. **Add to `.env`:**
   ```bash
   OPENAI_API_KEY=sk-from-openai...
   ```
3. **Modify `agent/mcp/reasoning.py`** to use OpenAI directly for intent parser
4. **Test and verify** all chat features work

### Long-Term (Proper Solution)

1. **Implement Solution 2** - Remove structured output requirement
2. **Add robust JSON parsing** with error handling
3. **Test with multiple OpenRouter models**
4. **Document which models work best**

## Files That Need Changes

### For Solution 1 (OpenAI for Intent Parser):
- `agent/mcp/reasoning.py` - Use OpenAI client for intent_parser_agent
- `agent/.env` - Add OPENAI_API_KEY

### For Solution 2 (Manual JSON Parsing):
- `agent/mcp/reasoning.py` - Remove output_type, add JSON extraction logic
- `agent/mcp/reasoning.py` - Update parse_intent function
- May need to update IntentResult validation

## Testing Commands

After applying fixes:

```bash
# Restart backend
cd backend/todo-backend
uv run uvicorn app:app --reload

# Test chat API
cd /home/wahaj-ali/Desktop/multi-phase-todo
uv run python test_simple_chat.py

# Run full feature test
uv run python test_chat_api_complete.py
```

## Current Test Results

```
Tests Passed: 5/10 (50%)
Tests Failed: 5/10

All failures due to: Intent parsing returning clarification instead of tool execution
```

## Summary

**The agent system is fully configured and ready, BUT the intent parser is blocked by OpenRouter model compatibility issues with the OpenAI Agents SDK's structured output feature.**

**To unblock:** Either use OpenAI directly for intent parsing (Solution 1) or implement manual JSON parsing (Solution 2).

**Recommended:** Solution 1 for immediate fix, then work on Solution 2 for long-term OpenRouter-only support.
