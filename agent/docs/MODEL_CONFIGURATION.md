# Model Configuration Guide

Complete guide for configuring the AI Task Assistant with different LLM providers.

## Overview

The agent system uses a centralized `ModelConfigService` that supports multiple LLM providers through the OpenAI Agents SDK with optional LiteLLM integration.

**Reference Implementation**: [Panaversity Learn Agentic AI - Model Configuration](https://github.com/panaversity/learn-agentic-ai/tree/main/01_ai_agents_first/05_model_configuration)

## Architecture

### Configuration Layers

```
┌─────────────────────────────────────────┐
│   Environment Variables (.env file)     │
│   - MODEL_PROVIDER                      │
│   - MODEL_NAME                          │
│   - API Keys                            │
│   - Model Parameters                    │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   ModelConfigService                    │
│   - Provider Detection                  │
│   - Model Resolution                    │
│   - Parameter Management                │
│   - Capabilities Mapping                │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   Model Provider                        │
│   - LiteLLM (optional)                  │
│   - Direct API (Gemini/OpenAI)          │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   Agent Instance                        │
│   - OpenAI Agents SDK                   │
│   - Function Tools                      │
└─────────────────────────────────────────┘
```

## Quick Configuration

### Step 1: Choose Your Provider

Select one of the following providers:

| Provider | Best For | Pricing | Speed |
|----------|----------|---------|-------|
| **Gemini** | Large context, multi-modal | Free tier available | ⚡⚡⚡ |
| **OpenAI** | General purpose, tools | Pay-per-use | ⚡⚡⚡ |
| **Anthropic** | Long documents, safety | Pay-per-use | ⚡⚡ |

### Step 2: Get API Key

**Google Gemini:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

**OpenAI:**
1. Visit https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (won't show again)

**Anthropic:**
1. Visit https://console.anthropic.com/settings/keys
2. Sign in or create account
3. Click "Create Key"
4. Copy the key

### Step 3: Configure .env

Create or edit `agent/.env`:

```bash
# For Gemini (Recommended for starting)
MODEL_PROVIDER=gemini
USE_LITELLM=false
MODEL_NAME=gemini-2.0-flash
GEMINI_API_KEY=your-actual-api-key-here
```

### Step 4: Verify Configuration

```bash
cd agent
python -c "from agent.config import get_model_config; c = get_model_config(); print(f'Provider: {c.provider}, Model: {c.model}')"
```

## Detailed Configuration Options

### Option 1: Gemini with Direct Endpoint (Recommended)

**Best for**: Production use, best performance, free tier

```bash
# Provider
MODEL_PROVIDER=gemini
USE_LITELLM=false

# Model
MODEL_NAME=gemini-2.0-flash
# or: MODEL_NAME=gemini-2.5-flash-preview-04-17

# API Key
GEMINI_API_KEY=AIzaSy...

# Endpoint (optional - uses default if not set)
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

# Model Parameters
MODEL_TEMPERATURE=0.4
MODEL_MAX_TOKENS=700
MODEL_TOP_P=0.9
```

**Pros:**
- ✅ Direct API access (no middleware)
- ✅ Free tier: 15 requests/minute
- ✅ Largest context window (1M tokens)
- ✅ Multi-modal support

**Cons:**
- ❌ Requires Google account

### Option 2: Gemini with LiteLLM

**Best for**: Testing multiple providers, unified interface

```bash
# Provider
MODEL_PROVIDER=gemini
USE_LITELLM=true

# Model (LiteLLM format)
MODEL_NAME=gemini-2.0-flash

# API Key
GEMINI_API_KEY=AIzaSy...
```

**Install LiteLLM:**
```bash
uv sync --extra litellm
```

**Pros:**
- ✅ Easy provider switching
- ✅ Unified interface across providers
- ✅ Consistent error handling

**Cons:**
- ❌ Additional dependency
- ❌ Slight latency overhead

### Option 3: OpenAI GPT-4

**Best for**: Tool use, general tasks, ecosystem integration

```bash
# Provider
MODEL_PROVIDER=openai
USE_LITELLM=false

# Model
MODEL_NAME=gpt-4.1-mini
# or: MODEL_NAME=gpt-5.2

# API Key
OPENAI_API_KEY=sk-...

# Model Parameters
MODEL_TEMPERATURE=0.4
MODEL_MAX_TOKENS=700
MODEL_TOP_P=0.9
```

**Pros:**
- ✅ Excellent tool use
- ✅ Large ecosystem
- ✅ Reliable performance

**Cons:**
- ❌ No free tier
- ❌ Smaller context than Gemini

### Option 4: Anthropic Claude

**Best for**: Long documents, careful reasoning, safety-critical

```bash
# Provider
MODEL_PROVIDER=anthropic
USE_LITELLM=true

# Model
MODEL_NAME=claude-3-5-sonnet-20240620

# API Key
ANTHROPIC_API_KEY=sk-ant-...

# Model Parameters
MODEL_TEMPERATURE=0.4
MODEL_MAX_TOKENS=700
MODEL_TOP_P=0.9
```

**Pros:**
- ✅ Largest context (200K tokens)
- ✅ Strong reasoning
- ✅ Safety-focused

**Cons:**
- ❌ Requires LiteLLM
- ❌ Slower than Gemini/OpenAI

### Option 5: Custom OpenAI-Compatible Endpoint

**Best for**: Self-hosted models, enterprise deployments

```bash
# Provider
MODEL_PROVIDER=custom

# Model
MODEL_NAME=your-model-name

# API Key
CUSTOM_API_KEY=your-api-key

# Endpoint
CUSTOM_BASE_URL=https://your-endpoint.com/v1
```

**Pros:**
- ✅ Self-hosted control
- ✅ Data privacy
- ✅ Custom models

**Cons:**
- ❌ Requires infrastructure
- ❌ Maintenance overhead

## Model Parameters Explained

### Temperature

Controls randomness vs determinism.

```bash
MODEL_TEMPERATURE=0.4  # Balanced (recommended)
```

| Value | Behavior | Use Case |
|-------|----------|----------|
| 0.0 - 0.3 | Deterministic, focused | Code generation, data extraction |
| 0.3 - 0.6 | Balanced (default) | General tasks, Q&A |
| 0.6 - 1.0 | Creative, diverse | Brainstorming, writing |

### Max Tokens

Controls maximum response length.

```bash
MODEL_MAX_TOKENS=700  # ~500 words (recommended)
```

| Value | Approx. Words | Use Case |
|-------|---------------|----------|
| 100-300 | ~75-225 | Short answers, confirmations |
| 300-700 | ~225-525 | Standard responses (default) |
| 700-2000 | ~525-1500 | Detailed explanations |

### Top P

Controls nucleus sampling diversity.

```bash
MODEL_TOP_P=0.9  # Diverse but focused (recommended)
```

| Value | Behavior | Use Case |
|-------|----------|----------|
| 0.5 - 0.8 | Focused, safe | Factual Q&A |
| 0.8 - 0.95 | Balanced (default) | General use |
| 0.95 - 1.0 | Diverse, creative | Creative writing |

## Runtime Model Switching

Change models without restarting:

```python
from agent.config import get_model_config, ModelProvider

# Get config service
config = get_model_config()

# Switch to OpenAI
config.switch_provider(ModelProvider.OPENAI, api_key="sk-...")

# Switch to specific model
config.switch_model("gemini-2.5-flash-preview-04-17")

# Verify
print(f"Current: {config.provider.value} / {config.model}")
```

## Model Capabilities

Access model capabilities programmatically:

```python
from agent.config import get_model_config

config = get_model_config()
capabilities = config.get_model_capabilities()

print(capabilities)
# {
#   "context_window": 1048576,
#   "max_output_tokens": 8192,
#   "supports_vision": True,
#   "supports_function_calling": True,
#   "provider": "gemini"
# }
```

## Troubleshooting

### Issue: "API key not configured"

**Solution:**
```bash
# Check .env file exists
ls -la agent/.env

# Verify API key is set
grep GEMINI_API_KEY agent/.env

# Restart application after changes
```

### Issue: "Model not found"

**Solution:**
1. Check model name is correct for provider
2. Verify provider matches API key
3. Check LiteLLM is installed if using `USE_LITELLM=true`

### Issue: Rate limit errors

**Solution:**
```bash
# Reduce request rate
RATE_LIMIT_REQUESTS=5
RATE_LIMIT_WINDOW=60

# Or upgrade API tier with provider
```

### Issue: Slow responses

**Solution:**
1. Try faster model (e.g., `gemini-2.0-flash`)
2. Reduce `MODEL_MAX_TOKENS`
3. Disable LiteLLM if not needed
4. Check network latency

## Best Practices

### 1. Start with Gemini Free Tier

```bash
MODEL_PROVIDER=gemini
MODEL_NAME=gemini-2.0-flash
GEMINI_API_KEY=your-key
```

### 2. Use Environment-Specific Configs

```bash
# .env.development
MODEL_NAME=gemini-2.0-flash
MODEL_TEMPERATURE=0.4

# .env.production
MODEL_NAME=gemini-2.5-flash-preview-04-17
MODEL_TEMPERATURE=0.3
```

### 3. Monitor Token Usage

```python
from agent.config import get_model_config

config = get_model_config()
print(f"Max tokens per response: {config.max_tokens}")
```

### 4. Test Multiple Models

```bash
# Test with different models
MODEL_NAME=gemini-2.0-flash      # Fast
MODEL_NAME=gemini-2.5-flash-preview-04-17  # Advanced
```

### 5. Secure API Keys

- ✅ Never commit `.env` to git
- ✅ Use secrets management in production
- ✅ Rotate keys periodically
- ✅ Use separate keys for dev/prod

## Performance Comparison

| Model | Speed | Context | Cost | Best For |
|-------|-------|---------|------|----------|
| `gemini-2.0-flash` | ⚡⚡⚡ | 1M | Free | General use |
| `gemini-2.5-flash-preview` | ⚡⚡ | 1M | Free | Complex tasks |
| `gpt-4.1-mini` | ⚡⚡⚡ | 128K | $$ | Tool use |
| `claude-3-5-sonnet` | ⚡⚡ | 200K | $$ | Long docs |

## Security Considerations

### API Key Storage

**Development:**
```bash
# Store in .env (gitignored)
GEMINI_API_KEY=your-key
```

**Production:**
```bash
# Use environment variables from secrets manager
export GEMINI_API_KEY=$(gcloud secrets versions access latest --secret=gemini-key)
```

### Rate Limiting

Protect against abuse:

```bash
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60
```

### Data Privacy

- Gemini: Data not used for training (paid tier)
- OpenAI: Enable zero retention if needed
- Anthropic: Strong privacy by default

## Resources

- [OpenAI Agents SDK Docs](https://github.com/openai/openai-agents-python)
- [LiteLLM Documentation](https://docs.litellm.ai)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Reference Implementation](https://github.com/panaversity/learn-agentic-ai/tree/main/01_ai_agents_first/05_model_configuration)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review `.env.example` for all options
3. Verify API key is valid
4. Check provider status pages
