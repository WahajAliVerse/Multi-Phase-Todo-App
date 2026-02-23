# Model Configuration Migration Guide

## Summary

Your agent system has been upgraded with comprehensive model configuration following the reference implementation from [Panaversity Learn Agentic AI](https://github.com/panaversity/learn-agentic-ai/tree/main/01_ai_agents_first/05_model_configuration).

## What Changed

### 1. New Configuration Service (`config/model_config.py`)

A centralized `ModelConfigService` that provides:
- ✅ Multi-provider support (Gemini, OpenAI, Anthropic)
- ✅ LiteLLM integration for unified interface
- ✅ Model capabilities mapping
- ✅ Runtime model switching
- ✅ Centralized parameter management

### 2. Enhanced Environment Configuration (`.env.example`)

New environment variables:
```bash
# Provider Selection
MODEL_PROVIDER=gemini              # Options: gemini, openai, anthropic, custom
USE_LITELLM=false                   # Enable LiteLLM for multi-provider

# Model Selection
MODEL_NAME=gemini-2.0-flash         # Generic model name
GEMINI_MODEL=gemini-2.0-flash       # Provider-specific
OPENAI_MODEL=gpt-4.1-mini
ANTHROPIC_MODEL=claude-3-5-sonnet-20240620

# Model Parameters
MODEL_TEMPERATURE=0.4               # 0.0-1.0
MODEL_MAX_TOKENS=700                # Response length
MODEL_TOP_P=0.9                     # Nucleus sampling

# API Keys (provider-specific)
GEMINI_API_KEY=your-key
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
CUSTOM_API_KEY=your-key
```

### 3. Updated Agent Module (`agent.py`)

Changes:
- ✅ Conditional LiteLLM import (optional dependency)
- ✅ Dynamic model configuration from service
- ✅ Support for multiple providers
- ✅ Enhanced model info endpoint
- ✅ Better error handling for missing dependencies

### 4. Documentation

New documentation files:
- `agent/README.md` - Complete agent documentation
- `agent/docs/MODEL_CONFIGURATION.md` - Detailed configuration guide
- `docs/MODEL_CONFIGURATION_MIGRATION.md` - This file

## Quick Start

### Step 1: Update Your .env File

Copy the new example file:

```bash
cd agent
cp .env.example .env
```

Your existing Gemini configuration will work as-is. The new system is backward compatible.

### Step 2: Install Dependencies

```bash
uv sync
```

For LiteLLM support (optional):
```bash
uv sync --extra litellm
```

### Step 3: Test Configuration

```bash
uv run python -c "from config import get_model_config; c = get_model_config(); print(f'Provider: {c.provider}, Model: {c.model}')"
```

Expected output:
```
✓ ModelConfigService loaded
  Provider: gemini
  Model: gemini-2.0-flash
  Temperature: 0.4
  Max Tokens: 700
  Top P: 0.9
```

## Backward Compatibility

Your existing code continues to work without changes:

```python
# Old imports still work
from agent.config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_BASE_URL

# New imports available
from agent.config import get_model_config, ModelProvider, ModelConfigService

# Agent usage unchanged
from agent.agent import create_agent, AgentRunner
```

## New Features

### 1. Provider Switching

```python
from agent.config import get_model_config, ModelProvider

config = get_model_config()

# Switch to OpenAI
config.switch_provider(ModelProvider.OPENAI, api_key="sk-...")

# Switch to Anthropic
config.switch_provider(ModelProvider.ANTHROPIC, api_key="sk-ant-...")
```

### 2. Model Capabilities

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

### 3. Model Info Endpoint

```python
from agent import get_model_info

info = get_model_info()
print(info)
# {
#   "provider": "gemini",
#   "model": "gemini-2.0-flash",
#   "temperature": 0.4,
#   "max_tokens": 700,
#   "top_p": 0.9,
#   "use_litellm": false,
#   "capabilities": {...}
# }
```

### 4. LiteLLM Integration

Enable in `.env`:
```bash
USE_LITELLM=true
MODEL_PROVIDER=gemini
```

Install LiteLLM:
```bash
uv sync --extra litellm
```

Use unified model string:
```python
from agent.config import get_model_config

config = get_model_config()
print(config.get_litellm_model_string())
# Output: "litellm/gemini/gemini-2.0-flash"
```

## Configuration Examples

### Example 1: Gemini (Current Setup - Unchanged)

```bash
MODEL_PROVIDER=gemini
USE_LITELLM=false
MODEL_NAME=gemini-2.0-flash
GEMINI_API_KEY=your-existing-key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

✅ Your current setup works exactly as before

### Example 2: OpenAI GPT-4

```bash
MODEL_PROVIDER=openai
USE_LITELLM=false
MODEL_NAME=gpt-4.1-mini
OPENAI_API_KEY=sk-your-openai-key
MODEL_TEMPERATURE=0.4
MODEL_MAX_TOKENS=700
```

### Example 3: Anthropic Claude (via LiteLLM)

```bash
MODEL_PROVIDER=anthropic
USE_LITELLM=true
MODEL_NAME=claude-3-5-sonnet-20240620
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

Requires: `uv sync --extra litellm`

### Example 4: Multi-Provider Testing

```bash
# Start with Gemini
MODEL_PROVIDER=gemini
MODEL_NAME=gemini-2.0-flash
GEMINI_API_KEY=your-gemini-key

# Switch at runtime in Python:
from agent.config import get_model_config, ModelProvider
config = get_model_config()
config.switch_provider(ModelProvider.OPENAI, api_key="sk-...")
```

## File Structure

```
agent/
├── config/
│   ├── __init__.py              # Updated exports
│   └── model_config.py          # NEW: ModelConfigService
├── agent.py                     # Updated: Multi-provider support
├── error_handler.py             # Updated: Import fixes
├── .env.example                 # Updated: Comprehensive options
├── README.md                    # Updated: Full documentation
├── pyproject.toml               # Updated: LiteLLM optional dependency
└── docs/
    └── MODEL_CONFIGURATION.md   # NEW: Detailed guide
```

## Testing

### Test 1: Configuration Service

```bash
cd agent
uv run python -c "from config import get_model_config; c = get_model_config(); print(c.provider, c.model)"
```

### Test 2: Agent Module

```bash
uv run python -c "from agent import get_model_info; print(get_model_info())"
```

### Test 3: Provider Switching

```bash
uv run python -c "
from agent.config import get_model_config, ModelProvider
c = get_model_config()
print('Current:', c.provider, c.model)
c.switch_provider(ModelProvider.OPENAI)
print('Switched:', c.provider, c.model)
"
```

## Troubleshooting

### Issue: "LiteLLM not found"

**Solution:** LiteLLM is optional. Either:
1. Install it: `uv sync --extra litellm`
2. Or set `USE_LITELLM=false` in `.env`

### Issue: "Import error with agent module"

**Solution:** Run from agent directory:
```bash
cd agent
uv run python -c "from agent import ..."
```

### Issue: "API key not configured"

**Solution:** Check `.env` file:
```bash
# For Gemini
GEMINI_API_KEY=AIzaSy...

# For OpenAI
OPENAI_API_KEY=sk-...

# For Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

## Migration Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Verify existing API keys are set
- [ ] Run `uv sync` to install dependencies
- [ ] Test configuration service
- [ ] Test agent module
- [ ] Review new documentation
- [ ] (Optional) Install LiteLLM for multi-provider
- [ ] (Optional) Test provider switching

## Benefits

### Before
- ❌ Single provider (Gemini only)
- ❌ Hardcoded configuration
- ❌ No runtime switching
- ❌ Limited model options

### After
- ✅ Multi-provider (Gemini, OpenAI, Anthropic)
- ✅ Centralized configuration service
- ✅ Runtime provider switching
- ✅ 100+ models via LiteLLM
- ✅ Model capabilities mapping
- ✅ Comprehensive documentation

## Reference

Implementation follows:
- [Panaversity Learn Agentic AI - Model Configuration](https://github.com/panaversity/learn-agentic-ai/tree/main/01_ai_agents_first/05_model_configuration)
- [OpenAI Agents SDK Documentation](https://github.com/openai/openai-agents-python)
- [LiteLLM Documentation](https://docs.litellm.ai)

## Next Steps

1. **Review Documentation**: Read `agent/docs/MODEL_CONFIGURATION.md` for detailed options
2. **Test Providers**: Try different providers to find the best fit
3. **Optimize Settings**: Adjust temperature, max_tokens, top_p for your use case
4. **Monitor Usage**: Track token usage and costs per provider
5. **Production Setup**: Configure secrets management for API keys

## Support

For issues or questions:
1. Check `agent/docs/MODEL_CONFIGURATION.md`
2. Review troubleshooting section above
3. Verify `.env` configuration
4. Check provider API key validity

---

**Migration completed successfully!** 🎉

Your agent system now has enterprise-grade model configuration with multi-provider support.
