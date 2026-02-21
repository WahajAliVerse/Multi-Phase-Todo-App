# Step-by-Step Guide: Configure OpenRouter with OpenAI Agents SDK

## Overview

This guide shows you how to configure your AI Task Assistant to use **OpenRouter** as the LLM provider instead of direct Gemini/OpenAI APIs.

**Benefits of OpenRouter:**
- ✅ Access to 400+ models through a single API
- ✅ Automatic fallbacks if a model is unavailable
- ✅ Cost optimization across providers
- ✅ Unified billing and usage tracking
- ✅ OpenAI-compatible API (easy integration)

---

## Step 1: Get OpenRouter API Key

### 1.1 Sign Up for OpenRouter

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Click **"Sign In"** (top right)
3. Sign in with Google, GitHub, or Email

### 1.2 Create API Key

1. Go to **[Keys](https://openrouter.ai/keys)** page
2. Click **"Create Key"**
3. Give it a name (e.g., "AI Task Assistant")
4. Copy the key immediately (won't show again)
5. Format: `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx`

### 1.3 Add Credits (Optional)

1. Go to **"Credits"** page
2. Add funds (minimum $5 recommended for testing)
3. Set spending limits if needed

---

## Step 2: Configure Your Agent System

### 2.1 Update Environment Variables

Edit your `agent/.env` file:

```bash
# Provider Selection
MODEL_PROVIDER=custom
USE_LITELLM=false

# Model Configuration
MODEL_NAME=openai/gpt-4.1-mini  # OpenRouter model name

# OpenRouter Configuration
CUSTOM_BASE_URL=https://openrouter.ai/api/v1
CUSTOM_API_KEY=sk-or-v1-your-actual-api-key-here

# Model Parameters
MODEL_TEMPERATURE=0.4
MODEL_MAX_TOKENS=700
MODEL_TOP_P=0.9

# Optional: App attribution for leaderboard
# OPENROUTER_REFERER=https://yoursite.com
# OPENROUTER_TITLE=AI Task Assistant

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60

# Backend API URL
BACKEND_API_URL=http://localhost:8000/api
```

### 2.2 Choose Your Model

OpenRouter uses the format: `provider/model-name`

**Popular Models for Agents:**

| Model | Use Case | Context | Price/1M tokens |
|-------|----------|---------|-----------------|
| `openai/gpt-4.1-mini` | General tasks, fast | 128K | $0.15 / $0.60 |
| `openai/gpt-4.1` | Complex reasoning | 128K | $2.00 / $8.00 |
| `anthropic/claude-3.5-sonnet` | Long docs, safety | 200K | $3.00 / $15.00 |
| `google/gemini-2.0-flash` | Multi-modal, fast | 1M | $0.10 / $0.40 |
| `deepseek/deepseek-v3` | Cost-effective | 128K | $0.14 / $0.28 |
| `meta-llama/llama-3.1-70b-instruct` | Open source | 128K | $0.18 / $0.18 |

**Recommended for Starting:**
```bash
MODEL_NAME=openai/gpt-4.1-mini  # Fast, affordable, good for agents
```

---

## Step 3: Update Agent Configuration

### 3.1 Modify `agent/config/model_config.py`

Add OpenRouter-specific configuration:

```python
# Add to ModelProvider enum
class ModelProvider(str, Enum):
    GEMINI = "gemini"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    CUSTOM = "custom"
    OPENROUTER = "openrouter"  # NEW
```

### 3.2 Update `agent/agent.py` for OpenRouter

Add OpenRouter configuration function:

```python
def configure_openrouter_model():
    """
    Configure OpenRouter as the model provider.
    
    Returns:
        OpenAIChatCompletionsModel configured for OpenRouter
    """
    if not os.getenv('CUSTOM_API_KEY'):
        logger.warning("CUSTOM_API_KEY not set for OpenRouter")
        return None
    
    # Create OpenAI client with OpenRouter endpoint
    openrouter_client = AsyncOpenAI(
        api_key=os.getenv('CUSTOM_API_KEY'),
        base_url=os.getenv('CUSTOM_BASE_URL', 'https://openrouter.ai/api/v1'),
        organization=None,
    )
    
    # Add optional headers for app attribution
    if os.getenv('OPENROUTER_REFERER'):
        openrouter_client.default_headers['HTTP-Referer'] = os.getenv('OPENROUTER_REFERER')
    if os.getenv('OPENROUTER_TITLE'):
        openrouter_client.default_headers['X-Title'] = os.getenv('OPENROUTER_TITLE')
    
    logger.info(f"Using OpenRouter with model: {MODEL_NAME}")
    
    return OpenAIChatCompletionsModel(
        model=MODEL_NAME,
        openai_client=openrouter_client,
    )
```

### 3.3 Update `configure_model()` Function

```python
def configure_model():
    """Configure the model based on provider settings."""
    
    # Check for OpenRouter first
    if os.getenv('MODEL_PROVIDER', '').lower() == 'openrouter' or \
       'openrouter.ai' in os.getenv('CUSTOM_BASE_URL', ''):
        return configure_openrouter_model()
    
    # ... rest of existing code ...
```

---

## Step 4: Disable Tracing (Important!)

Since OpenRouter is not OpenAI, you must disable tracing to avoid 401 errors:

### 4.1 In `agent/agent.py` (Already Done)

```python
from agents import set_tracing_disabled

# Disable tracing for third-party providers
os.environ['OPENAI_AGENTS_DISABLE_TRACING'] = '1'
set_tracing_disabled(True)
```

### 4.2 Alternative: Use OpenAI Key for Tracing Only

If you want tracing but use OpenRouter for inference:

```python
from agents import set_tracing_export_api_key

# Use OpenAI key ONLY for tracing (not inference)
set_tracing_export_api_key("sk-from-platform-openai-com")
```

---

## Step 5: Test Configuration

### 5.1 Create Test Script

Create `agent/test_openrouter.py`:

```python
#!/usr/bin/env python
"""
Test OpenRouter Configuration
"""

import asyncio
import os
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel, set_tracing_disabled

# Disable tracing
set_tracing_disabled(True)

async def test_openrouter():
    """Test OpenRouter connection and model."""
    
    print("=" * 70)
    print("OPENROUTER CONFIGURATION TEST")
    print("=" * 70)
    
    # Configuration
    api_key = os.getenv('CUSTOM_API_KEY')
    base_url = os.getenv('CUSTOM_BASE_URL', 'https://openrouter.ai/api/v1')
    model_name = os.getenv('MODEL_NAME', 'openai/gpt-4.1-mini')
    
    print(f"\n✓ Configuration:")
    print(f"  Base URL: {base_url}")
    print(f"  Model: {model_name}")
    print(f"  API Key Set: {'Yes' if api_key else 'No'}")
    
    if not api_key:
        print("\n❌ ERROR: CUSTOM_API_KEY not set!")
        return False
    
    try:
        # Create client
        print("\n✓ Creating OpenAI client...")
        client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
        )
        
        # Test simple completion
        print("✓ Testing model connection...")
        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "user", "content": "Say 'Hello from OpenRouter!'"}
            ],
            max_tokens=20,
        )
        
        print(f"\n✓ SUCCESS!")
        print(f"  Response: {response.choices[0].message.content}")
        print(f"  Model: {response.model}")
        print(f"  Usage: {response.usage.total_tokens} tokens")
        
        # Test with agent
        print("\n✓ Testing with Agent SDK...")
        agent = Agent(
            name="OpenRouter Test",
            instructions="You are a helpful assistant.",
            model=OpenAIChatCompletionsModel(
                model=model_name,
                openai_client=client,
            )
        )
        
        result = await Runner.run(agent, "What is 2 + 2?")
        print(f"  Agent Response: {result.final_output}")
        
        print("\n" + "=" * 70)
        print("ALL TESTS PASSED! ✅")
        print("=" * 70)
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_openrouter())
```

### 5.2 Run Test

```bash
cd agent
uv run python test_openrouter.py
```

**Expected Output:**
```
======================================================================
OPENROUTER CONFIGURATION TEST
======================================================================

✓ Configuration:
  Base URL: https://openrouter.ai/api/v1
  Model: openai/gpt-4.1-mini
  API Key Set: Yes

✓ Creating OpenAI client...
✓ Testing model connection...

✓ SUCCESS!
  Response: Hello from OpenRouter!
  Model: openai/gpt-4.1-mini
  Usage: 15 tokens

✓ Testing with Agent SDK...
  Agent Response: 2 + 2 equals 4.

======================================================================
ALL TESTS PASSED! ✅
======================================================================
```

---

## Step 6: Monitor Usage and Costs

### 6.1 Check OpenRouter Dashboard

1. Visit [https://openrouter.ai/activity](https://openrouter.ai/activity)
2. View:
   - Request volume
   - Token usage
   - Cost breakdown by model
   - Error rates

### 6.2 Set Up Alerts

1. Go to **Settings → Notifications**
2. Configure:
   - Credit balance alerts
   - Spending limit warnings
   - Error rate notifications

### 6.3 Optimize Costs

**Tips:**
- Use cheaper models for simple tasks (`gpt-4.1-mini` vs `gpt-4.1`)
- Set `max_tokens` appropriately
- Monitor token usage per request
- Consider caching frequent responses

---

## Step 7: Production Deployment

### 7.1 Environment Variables (Production)

```bash
# Production .env
MODEL_PROVIDER=openrouter
MODEL_NAME=openai/gpt-4.1-mini
CUSTOM_BASE_URL=https://openrouter.ai/api/v1
CUSTOM_API_KEY=sk-or-v1-prod-key-here

# App attribution (optional but recommended)
OPENROUTER_REFERER=https://your-production-domain.com
OPENROUTER_TITLE=Your App Name

# Rate limiting (adjust based on needs)
RATE_LIMIT_REQUESTS=20
RATE_LIMIT_WINDOW=60
```

### 7.2 Secrets Management

**Never commit API keys to git!** Use:

```bash
# Docker
docker run -e CUSTOM_API_KEY=$CUSTOM_API_KEY ...

# Kubernetes
kubectl create secret generic openrouter --from-literal=api-key=$CUSTOM_API_KEY

# Vercel/Netlify
vercel env add CUSTOM_API_KEY
```

### 7.3 Health Check Endpoint

Add to your backend:

```python
@router.get("/health/llm")
async def check_llm_health():
    """Check OpenRouter connectivity."""
    try:
        client = AsyncOpenAI(
            api_key=os.getenv('CUSTOM_API_KEY'),
            base_url=os.getenv('CUSTOM_BASE_URL'),
        )
        
        response = await client.chat.completions.create(
            model=os.getenv('MODEL_NAME'),
            messages=[{"role": "user", "content": "health check"}],
            max_tokens=5,
        )
        
        return {
            "status": "healthy",
            "provider": "openrouter",
            "model": response.model,
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
        }
```

---

## Troubleshooting

### Issue: 401 Unauthorized

**Cause:** Invalid or missing API key

**Solution:**
```bash
# Verify key format
echo $CUSTOM_API_KEY
# Should be: sk-or-v1-xxxxxxxxxxxxx

# Test key manually
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $CUSTOM_API_KEY"
```

### Issue: Model Not Found

**Cause:** Incorrect model name format

**Solution:**
```bash
# Use correct format: provider/model
MODEL_NAME=openai/gpt-4.1-mini  # ✅ Correct
MODEL_NAME=gpt-4.1-mini         # ❌ Wrong

# Check available models
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $CUSTOM_API_KEY"
```

### Issue: Tracing Errors

**Cause:** OpenAI tracing trying to use OpenRouter key

**Solution:**
```python
# Disable tracing completely
set_tracing_disabled(True)

# OR use separate OpenAI key for tracing
set_tracing_export_api_key("sk-from-openai-platform")
```

### Issue: High Costs

**Cause:** Using expensive models

**Solution:**
```bash
# Switch to cheaper model
MODEL_NAME=openai/gpt-4.1-mini  # $0.15/1M tokens
# Instead of
MODEL_NAME=openai/gpt-4.1       # $2.00/1M tokens

# Or use open source
MODEL_NAME=meta-llama/llama-3.1-70b-instruct  # $0.18/1M tokens
```

---

## Complete Example Configuration

### `.env` File (OpenRouter)

```bash
# =============================================================================
# OpenRouter Configuration
# =============================================================================

MODEL_PROVIDER=openrouter
USE_LITELLM=false

# Model Selection
MODEL_NAME=openai/gpt-4.1-mini

# OpenRouter API
CUSTOM_BASE_URL=https://openrouter.ai/api/v1
CUSTOM_API_KEY=sk-or-v1-your-api-key-here

# Optional: App Attribution
OPENROUTER_REFERER=https://your-app.com
OPENROUTER_TITLE=Your App Name

# Model Parameters
MODEL_TEMPERATURE=0.4
MODEL_MAX_TOKENS=700
MODEL_TOP_P=0.9

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60

# Backend
BACKEND_API_URL=http://localhost:8000/api
```

### Test Command

```bash
cd agent
uv run python test_openrouter.py
```

---

## Resources

- **OpenRouter Docs**: [https://openrouter.ai/docs](https://openrouter.ai/docs)
- **Model List**: [https://openrouter.ai/docs/models](https://openrouter.ai/docs/models)
- **Pricing**: [https://openrouter.ai/pricing](https://openrouter.ai/pricing)
- **API Status**: [https://status.openrouter.ai](https://status.openrouter.ai)
- **Community**: [https://discord.gg/openrouter](https://discord.gg/openrouter)

---

## Next Steps

1. ✅ Get OpenRouter API key
2. ✅ Update `.env` configuration
3. ✅ Run test script
4. ✅ Monitor usage dashboard
5. ✅ Deploy to production
6. ✅ Set up alerts and monitoring

**You're all set!** Your agent now uses OpenRouter with access to 400+ models! 🎉
