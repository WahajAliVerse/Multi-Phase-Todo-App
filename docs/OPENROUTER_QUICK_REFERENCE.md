# OpenRouter Configuration Summary

## Quick Start (3 Steps)

### 1. Get API Key
- Visit: https://openrouter.ai/keys
- Sign in and create key
- Copy: `sk-or-v1-xxxxxxxxxxxxx`

### 2. Update `.env`
```bash
MODEL_PROVIDER=custom
MODEL_NAME=openai/gpt-4.1-mini
CUSTOM_BASE_URL=https://openrouter.ai/api/v1
CUSTOM_API_KEY=sk-or-v1-your-key-here
```

### 3. Test
```bash
cd agent
uv run python test_openrouter.py
```

---

## What is OpenRouter?

**OpenRouter** is a unified API that gives you access to 400+ AI models from a single endpoint.

**Benefits:**
- ✅ One API key for all models (OpenAI, Anthropic, Google, Meta, etc.)
- ✅ Automatic fallbacks if models are unavailable
- ✅ Cost optimization across providers
- ✅ Unified billing and usage tracking
- ✅ OpenAI-compatible (minimal code changes)

---

## Available Models (Top Picks)

| Model | Best For | Context | Price/1M tokens |
|-------|----------|---------|-----------------|
| `openai/gpt-4.1-mini` | **General tasks (recommended)** | 128K | $0.15 / $0.60 |
| `openai/gpt-4.1` | Complex reasoning | 128K | $2.00 / $8.00 |
| `anthropic/claude-3.5-sonnet` | Long documents | 200K | $3.00 / $15.00 |
| `google/gemini-2.0-flash` | Multi-modal | 1M | $0.10 / $0.40 |
| `deepseek/deepseek-v3` | **Best value** | 128K | $0.14 / $0.28 |
| `meta-llama/llama-3.1-70b-instruct` | Open source | 128K | $0.18 / $0.18 |

---

## Configuration Files

### `/agent/.env`
```bash
# Provider
MODEL_PROVIDER=custom
USE_LITELLM=false

# Model
MODEL_NAME=openai/gpt-4.1-mini

# OpenRouter
CUSTOM_BASE_URL=https://openrouter.ai/api/v1
CUSTOM_API_KEY=sk-or-v1-your-key-here

# Optional attribution
OPENROUTER_REFERER=https://your-app.com
OPENROUTER_TITLE=Your App Name

# Parameters
MODEL_TEMPERATURE=0.4
MODEL_MAX_TOKENS=700
MODEL_TOP_P=0.9
```

---

## Code Changes Required

### Minimal Changes (Already Compatible!)

Your current agent system already supports OpenRouter through the `CUSTOM` provider!

**What's already working:**
- ✅ `ModelConfigService` supports custom providers
- ✅ `CUSTOM_BASE_URL` and `CUSTOM_API_KEY` environment variables
- ✅ `OpenAIChatCompletionsModel` works with any OpenAI-compatible endpoint

**What you need to add:**

In `agent/agent.py`, update `configure_model()`:

```python
def configure_model():
    if model_config.provider == ModelProvider.CUSTOM:
        # Use custom provider (OpenRouter)
        logger.info(f"Using custom provider: {model_config.model}")
        
        custom_client = AsyncOpenAI(
            api_key=model_config.api_key,
            base_url=model_config.base_url,
            organization=None,
        )
        
        return OpenAIChatCompletionsModel(
            model=model_config.model,
            openai_client=custom_client,
        )
    
    # ... rest of existing code ...
```

---

## Testing

### Quick Test
```bash
cd agent
uv run python -c "
from config import get_model_config
c = get_model_config()
print(f'Provider: {c.provider}')
print(f'Model: {c.model}')
print(f'Base URL: {c.base_url}')
"
```

### Full Test
```bash
uv run python test_openrouter.py
```

### Test Chat Endpoint
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -d '{"message": "Hello from OpenRouter!"}'
```

---

## Monitoring

### Dashboard
- **Usage**: https://openrouter.ai/activity
- **Costs**: https://openrouter.ai/credits
- **Models**: https://openrouter.ai/docs/models

### Set Alerts
1. Go to Settings → Notifications
2. Enable:
   - Low credit balance
   - Spending limit reached
   - High error rate

---

## Troubleshooting

### 401 Unauthorized
```bash
# Check API key format
echo $CUSTOM_API_KEY
# Should be: sk-or-v1-xxxxxxxxxxxxx

# Test key
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $CUSTOM_API_KEY"
```

### Model Not Found
```bash
# Use correct format
MODEL_NAME=openai/gpt-4.1-mini  # ✅ provider/model
MODEL_NAME=gpt-4.1-mini         # ❌ wrong

# List available models
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $CUSTOM_API_KEY"
```

### Tracing Errors
```python
# Already disabled in your agent.py
from agents import set_tracing_disabled
set_tracing_disabled(True)
```

---

## Cost Optimization Tips

1. **Use right model for task**
   - Simple tasks: `gpt-4.1-mini` ($0.15/1M)
   - Complex reasoning: `gpt-4.1` ($2.00/1M)

2. **Set token limits**
   ```bash
   MODEL_MAX_TOKENS=700  # Limit response length
   ```

3. **Monitor usage**
   - Check dashboard daily
   - Set spending alerts
   - Track cost per request

4. **Cache responses**
   - Cache frequent queries
   - Reduce redundant API calls

---

## Production Checklist

- [ ] API key stored in secrets manager (not .env)
- [ ] Rate limiting configured
- [ ] Monitoring/alerts set up
- [ ] Health check endpoint added
- [ ] Error handling tested
- [ ] Cost budget set
- [ ] Backup provider configured

---

## Resources

- **Docs**: https://openrouter.ai/docs
- **Models**: https://openrouter.ai/docs/models
- **Pricing**: https://openrouter.ai/pricing
- **Status**: https://status.openrouter.ai
- **Discord**: https://discord.gg/openrouter

---

## Comparison: Direct API vs OpenRouter

| Feature | Direct API | OpenRouter |
|---------|-----------|------------|
| **Setup Complexity** | Multiple keys | Single key ✅ |
| **Model Access** | One provider | 400+ models ✅ |
| **Billing** | Multiple bills | Unified ✅ |
| **Fallbacks** | Manual | Automatic ✅ |
| **Cost Optimization** | Manual | Built-in ✅ |
| **Usage Tracking** | Per provider | Unified dashboard ✅ |

---

## Next Steps

1. ✅ Read full guide: `docs/OPENROUTER_SETUP_GUIDE.md`
2. ✅ Get API key from OpenRouter
3. ✅ Update `.env` configuration
4. ✅ Run test script
5. ✅ Deploy to production
6. ✅ Monitor usage and optimize costs

**You're ready to use OpenRouter!** 🚀
