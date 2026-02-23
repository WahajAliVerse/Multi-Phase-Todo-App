# OpenRouter Architecture & Integration

## System Architecture

### Before (Direct Provider)

```
┌─────────────────────────────────────────────────────────┐
│                  Your Agent System                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Gemini     │  │   OpenAI     │  │  Anthropic   │ │
│  │   Config     │  │   Config     │  │   Config     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
│         ▼                 ▼                 ▼          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Gemini API   │  │ OpenAI API   │  │ Anthropic    │ │
│  │ Key: AIza... │  │ Key: sk-...  │  │ Key: sk-ant  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │
          ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ Google   │      │ OpenAI   │      │ Anthropic│
    │ Servers  │      │ Servers  │      │ Servers  │
    └──────────┘      └──────────┘      └──────────┘
    
❌ Multiple API keys to manage
❌ Different billing for each
❌ No automatic fallbacks
❌ Provider-specific rate limits
```

### After (OpenRouter)

```
┌─────────────────────────────────────────────────────────┐
│                  Your Agent System                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           OpenRouter Configuration               │  │
│  │  - Single API Key: sk-or-v1-...                  │  │
│  │  - Base URL: openrouter.ai/api/v1                │  │
│  │  - Model: provider/model-name                    │  │
│  └────────────────────┬─────────────────────────────┘  │
│                       │                                  │
│                       ▼                                  │
│              ┌────────────────┐                         │
│              │  OpenRouter    │                         │
│              │  API Gateway   │                         │
│              └───────┬────────┘                         │
│                      │                                   │
│         ┌────────────┼────────────┬──────────────┐      │
│         │            │            │              │      │
│         ▼            ▼            ▼              ▼      │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│   │ OpenAI   │ │ Anthropic│ │ Google   │ │  Meta    │ │
│   │  GPT-4   │ │  Claude  │ │  Gemini  │ │  Llama   │ │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘

✅ Single API key for all models
✅ Unified billing
✅ Automatic fallbacks
✅ 400+ models available
✅ Cost optimization built-in
```

---

## Request Flow

### Standard Request Flow

```
User Request
    │
    ▼
┌─────────────────┐
│  FastAPI Backend │
│  /api/chat      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Agent Runner   │
│  (OpenAI SDK)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AsyncOpenAI    │
│  Client         │
│  base_url:      │
│  openrouter.ai  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenRouter     │
│  API Gateway    │
└────────┬────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
         ▼              ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ OpenAI  │   │Anthropic│   │ Google  │   │  Meta   │
   │ Servers │   │ Servers │   │ Servers │   │ Servers │
   └─────────┘   └─────────┘   └─────────┘   └─────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  OpenRouter     │
                    │  (Aggregates    │
                    │   Responses)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Your Agent     │
                    │  (Single        │
                    │   Response)     │
                    └─────────────────┘
```

---

## Configuration Layers

### Layer 1: Environment Variables

```bash
┌─────────────────────────────────────────┐
│           .env File                     │
├─────────────────────────────────────────┤
│ MODEL_PROVIDER=custom                   │
│ MODEL_NAME=openai/gpt-4.1-mini          │
│ CUSTOM_BASE_URL=                        │
│   https://openrouter.ai/api/v1          │
│ CUSTOM_API_KEY=sk-or-v1-xxxxx           │
│ MODEL_TEMPERATURE=0.4                   │
│ MODEL_MAX_TOKENS=700                    │
└─────────────────────────────────────────┘
```

### Layer 2: Model Configuration Service

```python
┌─────────────────────────────────────────┐
│      ModelConfigService                 │
├─────────────────────────────────────────┤
│ - Detects CUSTOM provider               │
│ - Loads base_url from env               │
│ - Loads api_key from env                │
│ - Provides model capabilities           │
│ - Supports runtime switching            │
└─────────────────────────────────────────┘
```

### Layer 3: OpenAI Client

```python
┌─────────────────────────────────────────┐
│      AsyncOpenAI Client                 │
├─────────────────────────────────────────┤
│ api_key = CUSTOM_API_KEY                │
│ base_url = CUSTOM_BASE_URL              │
│ organization = None                     │
│                                         │
│ → Creates authenticated client          │
│ → Routes to OpenRouter endpoint         │
└─────────────────────────────────────────┘
```

### Layer 4: Agent Model

```python
┌─────────────────────────────────────────┐
│  OpenAIChatCompletionsModel             │
├─────────────────────────────────────────┤
│ model = "openai/gpt-4.1-mini"           │
│ openai_client = custom_client           │
│                                         │
│ → Wraps client for Agent SDK            │
│ → Handles Chat Completions API          │
└─────────────────────────────────────────┘
```

### Layer 5: Agent

```python
┌─────────────────────────────────────────┐
│         Agent                           │
├─────────────────────────────────────────┤
│ name = "TodoAssistant"                  │
│ instructions = "..."                    │
│ model = OpenAIChatCompletionsModel(...) │
│ tools = [create_task, get_tasks, ...]   │
│                                         │
│ → Uses configured model                 │
│ → Executes tools based on intent        │
└─────────────────────────────────────────┘
```

---

## Data Flow

### User Request → Response

```
1. User sends message
   ↓
2. Backend receives at /api/chat
   ↓
3. Agent Runner processes request
   ↓
4. OpenAIChatCompletionsModel formats request
   ↓
5. AsyncOpenAI client sends to OpenRouter
   POST https://openrouter.ai/api/v1/chat/completions
   Headers:
     Authorization: Bearer sk-or-v1-xxxxx
     Content-Type: application/json
   Body:
     {
       "model": "openai/gpt-4.1-mini",
       "messages": [...],
       "tools": [...],
       "temperature": 0.4
     }
   ↓
6. OpenRouter routes to actual provider
   (e.g., OpenAI servers)
   ↓
7. Provider processes and returns response
   ↓
8. OpenRouter aggregates and returns to you
   {
     "choices": [{
       "message": {
         "content": "I've created your task...",
         "tool_calls": [...]
       }
     }],
     "usage": {
       "prompt_tokens": 50,
       "completion_tokens": 100,
       "total_tokens": 150
     }
   }
   ↓
9. Agent parses response
   ↓
10. Backend returns to user
```

---

## Cost Flow

```
┌──────────────────────────────────────────────────────┐
│              OpenRouter Billing                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Your Usage → OpenRouter → Actual Provider          │
│                                                      │
│  Example:                                            │
│  1M tokens via gpt-4.1-mini                         │
│                                                      │
│  You pay OpenRouter: $0.15 (input) + $0.60 (output) │
│  OpenRouter pays OpenAI: Wholesale rate             │
│  Difference: OpenRouter's margin                    │
│                                                      │
│  Benefits:                                           │
│  ✓ Volume discounts                                  │
│  ✓ No minimum spend per provider                    │
│  ✓ Unified billing across all models                │
│  ✓ Automatic cost optimization                      │
└──────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────┐
│            Error Handling with OpenRouter           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Provider Error (e.g., OpenAI down)                │
│         ↓                                           │
│  OpenRouter detects failure                        │
│         ↓                                           │
│  Automatic fallback to backup provider             │
│  (e.g., switch to Anthropic)                       │
│         ↓                                           │
│  Returns successful response to you                │
│         ↓                                           │
│  Your agent continues without interruption         │
│                                                     │
│  Without OpenRouter:                               │
│  Provider Error → Your agent fails → User error   │
│                                                     │
│  With OpenRouter:                                  │
│  Provider Error → Auto-fallback → Success ✅      │
└─────────────────────────────────────────────────────┘
```

---

## Security Model

```
┌──────────────────────────────────────────────────────┐
│              Security Considerations                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  API Key Storage:                                    │
│  ┌────────────────────────────────────────────┐     │
│  │ ❌ Don't: Hardcode in code                 │     │
│  │ ❌ Don't: Commit to git                    │     │
│  │ ✅ Do: Use environment variables           │     │
│  │ ✅ Do: Use secrets manager in production   │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  Request Encryption:                                 │
│  ┌────────────────────────────────────────────┐     │
│  │ ✓ HTTPS/TLS for all API calls             │     │
│  │ ✓ Bearer token authentication             │     │
│  │ ✓ No keys in logs                         │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  Rate Limiting:                                      │
│  ┌────────────────────────────────────────────┐     │
│  │ ✓ OpenRouter enforces provider limits     │     │
│  │ ✓ Your app should add additional limits   │     │
│  │ ✓ Monitor usage dashboard                 │     │
│  └────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

```
┌──────────────────────────────────────────────────────┐
│           OpenRouter Dashboard                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Metrics Available:                                  │
│  ┌────────────────────────────────────────────┐     │
│  │ 📊 Request Volume (by model, by time)     │     │
│  │ 💰 Cost Breakdown (by model, by day)      │     │
│  │ ⚡ Latency (p50, p95, p99)                 │     │
│  │ ❌ Error Rates (by model, by provider)    │     │
│  │ 🔥 Token Usage (input, output, total)     │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  Alerts to Configure:                                │
│  ┌────────────────────────────────────────────┐     │
│  │ ⚠️  Low credit balance                    │     │
│  │ ⚠️  Spending limit reached                │     │
│  │ ⚠️  High error rate                       │     │
│  │ ⚠️  Unusual usage spike                   │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  Your App Monitoring:                                │
│  ┌────────────────────────────────────────────┐     │
│  │ → Add health check endpoint               │     │
│  │ → Log API response times                  │     │
│  │ → Track token usage per request           │     │
│  │ → Monitor error rates                     │     │
│  └────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

---

## Migration Path

### Phase 1: Testing (Current)

```
Your Agent → OpenRouter → Single Model
Purpose: Verify configuration works
```

### Phase 2: Partial Production

```
Your Agent → OpenRouter → Primary Model
                      └→ Backup Model (manual)
Purpose: Test with real users, monitor costs
```

### Phase 3: Full Production

```
Your Agent → OpenRouter → Primary Model
                      └→ Backup Model (auto-fallback)
                      └→ Cost-optimized routing
Purpose: Production with high availability
```

### Phase 4: Optimization

```
Your Agent → OpenRouter → Smart Routing
                      ├→ Cheap model for simple tasks
                      ├→ Powerful model for complex tasks
                      └→ Auto-fallback on errors
Purpose: Optimized cost/performance balance
```

---

## Summary

**OpenRouter provides:**
- ✅ Single integration point for 400+ models
- ✅ Automatic failover and fallbacks
- ✅ Unified billing and usage tracking
- ✅ Cost optimization across providers
- ✅ OpenAI-compatible API (minimal code changes)

**Your agent system is already compatible!**
- Just update `.env` with OpenRouter credentials
- No code changes required (uses existing CUSTOM provider)
- Test with included scripts
- Monitor via OpenRouter dashboard

**Next Steps:**
1. Get API key from openrouter.ai
2. Update `.env` configuration
3. Run test script
4. Deploy to production
5. Monitor and optimize

🎉 **You're ready to go!**
