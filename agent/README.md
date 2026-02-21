# AI Task Assistant Agent

Multi-provider AI agent for natural language task management using the OpenAI Agents SDK.

## Features

- 🤖 **Multi-Provider Support**: Gemini, OpenAI GPT, Anthropic Claude via LiteLLM
- ⚙️ **Flexible Configuration**: Centralized model configuration service
- 🔄 **Model Switching**: Runtime provider and model switching capability
- 🛠️ **Tool Integration**: Function calling for task, tag, and reminder management
- 📊 **Rate Limiting**: Configurable rate limits per user

## Quick Start

### 1. Install Dependencies

```bash
cd agent
uv sync
```

### 2. Configure Environment

Copy the example environment file and configure your API key:

```bash
cp .env.example .env
```

Edit `.env` and set your API key:

```bash
# For Google Gemini (default)
MODEL_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key-here
MODEL_NAME=gemini-2.0-flash

# Or for OpenAI
# MODEL_PROVIDER=openai
# OPENAI_API_KEY=your-openai-api-key-here
# MODEL_NAME=gpt-4.1-mini

# Or for Anthropic Claude
# MODEL_PROVIDER=anthropic
# ANTHROPIC_API_KEY=your-anthropic-api-key-here
# MODEL_NAME=claude-3-5-sonnet-20240620
```

### 3. Get API Keys

- **Google Gemini**: https://makersuite.google.com/app/apikey
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys

### 4. Run the Agent

```bash
python -m agent.main
```

## Configuration Reference

### Environment Variables

#### Provider Selection

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `MODEL_PROVIDER` | LLM provider to use | `gemini` | `gemini`, `openai`, `anthropic`, `custom` |
| `USE_LITELLM` | Use LiteLLM for routing | `false` | `true`, `false` |

#### Model Selection

| Variable | Description | Default |
|----------|-------------|---------|
| `MODEL_NAME` | Generic model name | `gemini-2.0-flash` |
| `GEMINI_MODEL` | Gemini-specific model | `gemini-2.0-flash` |
| `OPENAI_MODEL` | OpenAI-specific model | `gpt-4.1-mini` |
| `ANTHROPIC_MODEL` | Anthropic-specific model | `claude-3-5-sonnet-20240620` |

#### Model Parameters

| Variable | Description | Default | Range |
|----------|-------------|---------|-------|
| `MODEL_TEMPERATURE` | Creativity vs determinism | `0.4` | 0.0 - 1.0 |
| `MODEL_MAX_TOKENS` | Maximum response length | `700` | 1 - 32000 |
| `MODEL_TOP_P` | Nucleus sampling | `0.9` | 0.0 - 1.0 |

#### API Keys

| Variable | Provider | Required |
|----------|----------|----------|
| `GEMINI_API_KEY` | Gemini | Yes (if using Gemini) |
| `OPENAI_API_KEY` | OpenAI | Yes (if using OpenAI) |
| `ANTHROPIC_API_KEY` | Anthropic | Yes (if using Anthropic) |
| `CUSTOM_API_KEY` | Custom | Yes (if using Custom) |

#### Custom Provider

| Variable | Description | Example |
|----------|-------------|---------|
| `CUSTOM_BASE_URL` | OpenAI-compatible endpoint | `https://your-endpoint.com/v1` |

#### Gemini Endpoint

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_BASE_URL` | Gemini Chat Completions API | `https://generativelanguage.googleapis.com/v1beta/openai/` |

#### Rate Limiting

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_REQUESTS` | Max requests per window | `10` |
| `RATE_LIMIT_WINDOW` | Window size in seconds | `60` |

## Example Configurations

### Example 1: Gemini with Direct Endpoint (Default)

```bash
MODEL_PROVIDER=gemini
USE_LITELLM=false
MODEL_NAME=gemini-2.0-flash
GEMINI_API_KEY=your-key-here
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

### Example 2: Gemini with LiteLLM

```bash
MODEL_PROVIDER=gemini
USE_LITELLM=true
MODEL_NAME=gemini-2.0-flash
GEMINI_API_KEY=your-key-here
```

### Example 3: OpenAI GPT-4

```bash
MODEL_PROVIDER=openai
USE_LITELLM=false
MODEL_NAME=gpt-4.1-mini
OPENAI_API_KEY=your-key-here
```

### Example 4: Anthropic Claude via LiteLLM

```bash
MODEL_PROVIDER=anthropic
USE_LITELLM=true
MODEL_NAME=claude-3-5-sonnet-20240620
ANTHROPIC_API_KEY=your-key-here
```

### Example 5: Custom OpenAI-Compatible Endpoint

```bash
MODEL_PROVIDER=custom
MODEL_NAME=your-model-name
CUSTOM_API_KEY=your-key-here
CUSTOM_BASE_URL=https://your-endpoint.com/v1
```

## Model Configuration Service

The `ModelConfigService` provides centralized model management:

```python
from agent.config import get_model_config, ModelProvider

# Get configuration service
config = get_model_config()

# Access current settings
print(f"Provider: {config.provider}")
print(f"Model: {config.model}")
print(f"Temperature: {config.temperature}")

# Get LiteLLM model string
litellm_string = config.get_litellm_model_string()
# Returns: "litellm/gemini/gemini-2.0-flash"

# Get model capabilities
capabilities = config.get_model_capabilities()
# Returns: {context_window, max_output_tokens, supports_vision, ...}

# Switch provider at runtime
config.switch_provider(ModelProvider.OPENAI, api_key="sk-...")

# Switch model
config.switch_model("gemini-2.5-flash-preview-04-17")
```

## Supported Models

### Gemini Models

| Model | Context Window | Max Output | Vision | Function Calling |
|-------|---------------|------------|--------|------------------|
| `gemini-2.0-flash` | 1,048,576 | 8,192 | ✅ | ✅ |
| `gemini-2.5-flash-preview-04-17` | 1,048,576 | 8,192 | ✅ | ✅ |

### OpenAI Models

| Model | Context Window | Max Output | Vision | Function Calling |
|-------|---------------|------------|--------|------------------|
| `gpt-4.1-mini` | 128,000 | 16,384 | ✅ | ✅ |
| `gpt-5.2` | 128,000 | 32,768 | ✅ | ✅ |

### Anthropic Models

| Model | Context Window | Max Output | Vision | Function Calling |
|-------|---------------|------------|--------|------------------|
| `claude-3-5-sonnet-20240620` | 200,000 | 8,192 | ✅ | ✅ |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Agent Layer                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Agent (TodoAssistant)                          │   │
│  │  - Instructions                                 │   │
│  │  - Tools (Task, Tag, Reminder)                  │   │
│  │  - Model Settings                               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Model Configuration Service                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ModelConfigService                             │   │
│  │  - Provider Detection                           │   │
│  │  - Model Selection                              │   │
│  │  - Parameter Management                         │   │
│  │  - Capabilities Mapping                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Model Provider Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   LiteLLM    │  │    Gemini    │  │    OpenAI    │ │
│  │  (Optional)  │  │  Direct API  │  │  Direct API  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## API Reference

### Creating an Agent

```python
from agent.agent import create_agent, AgentRunner
from agents import ModelSettings

# Create agent with custom settings
agent = create_agent(
    name="MyAssistant",
    instructions="Custom instructions...",
    tools=[tool1, tool2],
    model_settings=ModelSettings(
        temperature=0.7,
        max_tokens=1000,
    )
)

# Create runner
runner = AgentRunner(agent)

# Run synchronously
result = runner.run_sync("Create a task to buy groceries")
print(result["message"]["content"])

# Run asynchronously
result = await runner.run_async("Create a task to buy groceries")
print(result["message"]["content"])
```

### Getting Model Info

```python
from agent.agent import get_model_info

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

## Troubleshooting

### "API key not set" Warning

Ensure your `.env` file contains the correct API key for your selected provider:

```bash
GEMINI_API_KEY=AIzaSy...  # For Gemini
# OR
OPENAI_API_KEY=sk-...    # For OpenAI
# OR
ANTHROPIC_API_KEY=sk-ant-...  # For Anthropic
```

### "Model not found" Error

Check that `MODEL_NAME` matches a supported model for your provider. See the [Supported Models](#supported-models) section above.

### Rate Limit Errors

If you encounter rate limit errors, adjust the settings in `.env`:

```bash
RATE_LIMIT_REQUESTS=5     # Reduce requests
RATE_LIMIT_WINDOW=60      # Per minute
```

### LiteLLM Installation

To use LiteLLM for multi-provider support:

```bash
uv sync --extra litellm
```

Then enable it in `.env`:

```bash
USE_LITELLM=true
```

## Reference

This implementation follows the model configuration patterns from:
- [Panaversity Learn Agentic AI - Model Configuration](https://github.com/panaversity/learn-agentic-ai/tree/main/01_ai_agents_first/05_model_configuration)
- [OpenAI Agents SDK Documentation](https://github.com/openai/openai-agents-python)

## License

MIT
