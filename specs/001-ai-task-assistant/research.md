# Phase 0 Research: OpenAI Agents SDK Integration

## Research Questions & Findings

### 1. OpenAI Agents Python SDK

**Decision**: Use `openai-agents` package (official OpenAI Agents Python SDK)

**Rationale**:
- Official SDK from OpenAI with production-ready features
- Built-in MCP (Model Context Protocol) server tool calling
- Minimal learning curve with Python-first design
- Includes agent loop, sessions, guardrails, and tracing
- Production upgrade of Swarm pattern

**Installation**:
```bash
uv add openai-agents
```

**Environment Setup**:
```bash
export OPENAI_API_KEY=sk-...
```

**Hello World Example**:
```python
from agents import Agent, Runner

agent = Agent(name="Assistant", instructions="You are a helpful assistant")
result = Runner.run_sync(agent, "Write a haiku about recursion.")
print(result.final_output)
```

**Alternatives Considered**:
- Google Gemini + OpenAI SDK compatibility layer: Unnecessary complexity, use official SDK
- LangChain: Too heavy, more abstraction than needed
- Custom implementation: Reinventing the wheel, SDK is production-ready

**Documentation**: https://openai.github.io/openai-agents-python/

---

### 2. MCP Integration with OpenAI Agents SDK

**Decision**: Use built-in MCP server tool calling from OpenAI Agents SDK

**Rationale**:
- Native MCP support in SDK (no additional configuration needed)
- Works identically to function tools
- Seamless server integration
- Part of core SDK features

**Integration Pattern**:
```python
from agents import Agent, Runner, MCPServer

# MCP servers work as tools automatically
agent = Agent(
    name="TodoAssistant",
    instructions="Help users manage tasks",
    tools=[mcp_server_tool]  # MCP tools integrated natively
)
```

**Key Features**:
- MCP servers provide external tool integration
- Built-in protocol handling
- Automatic schema generation
- Same interface as function tools

---

### 3. Agent Configuration & Execution

**Decision**: Use Agent/Runner pattern from OpenAI Agents SDK

**Agent Configuration**:
```python
from agents import Agent

agent = Agent(
    name="TodoAssistant",
    instructions="You are a senior AI assistant for a production Todo app. Handle user intents via tools, clarify ambiguities with MCP, and ensure secure, efficient operations.",
    tools=[task_tools, tag_tools, recurrence_tools]
)
```

**Runner Execution**:
```python
from agents import Runner

# Synchronous execution
result = Runner.run_sync(agent, "Create a task to buy groceries tomorrow")
print(result.final_output)

# Or async execution
result = await Runner.run(agent, "Create a task...")
```

**Agent Loop**:
- Built-in loop handles tool invocation automatically
- Continues until task completion
- No manual loop management needed

---

### 4. Function Tools

**Decision**: Use `@function_tool` decorator for backend API wrappers

**Pattern**:
```python
from agents import function_tool

@function_tool
def create_task(title: str, description: str = None, due_date: str = None):
    """Create a new task in the todo app"""
    # Implementation calls existing backend API
    return {"success": True, "task_id": "..."}
```

**Features**:
- Automatic schema generation
- Pydantic-powered validation
- Type hints become tool schema
- Docstring becomes tool description

---

### 5. Sessions (Persistent Memory)

**Decision**: Use sessions for conversation history persistence

**Session Types Available**:
- Basic Sessions - In-memory
- SQLAlchemy Sessions - Database-backed
- Advanced SQLite Sessions - File-based
- Encrypted Sessions - Secure storage

**Pattern**:
```python
from agents import Runner, Session

session = Session("user-123")  # User-specific session
result = Runner.run_sync(agent, "Create task...", session=session)
```

**Benefits**:
- Maintains conversation context
- Multiple conversation support
- Persistent across runs
- Built-in state management

---

### 6. Guardrails

**Decision**: Implement guardrails for input/output validation

**Pattern**:
```python
from agents import Agent, InputGuardrail, OutputGuardrail

agent = Agent(
    name="TodoAssistant",
    instructions="...",
    input_guardrails=[...],
    output_guardrails=[...]
)
```

**Features**:
- Parallel input validation
- Output safety checks
- Fail-fast behavior
- Built-in safety mechanisms

---

### 7. Tracing

**Decision**: Enable built-in tracing for observability

**Features**:
- Automatic trace/span creation
- Workflow visualization
- Debugging support
- OpenAI evaluation tools integration
- Fine-tuning data collection

**Pattern**:
```python
from agents import set_trace_processors

set_trace_processors([...])
```

---

## Technology Choices Summary

| Component | Choice | Rationale |
|-----------|--------|-----------|
| LLM/Agent SDK | OpenAI Agents Python (`openai-agents`) | Official SDK, built-in MCP, production-ready |
| LLM Provider | Google Gemini 2.0 Flash | Cost-effective, excellent NLP, OpenAI-compatible endpoint |
| Installation | `uv add openai-agents` | Consistent with project uv workflow |
| Agent Pattern | `Agent(name="...", instructions="...")` | SDK standard pattern |
| Runner Pattern | `Runner.run_sync()` or `Runner.run()` | SDK execution pattern |
| Model Configuration | `OpenAIChatCompletionsModel` with Gemini | OpenAI-compatible endpoint for Gemini |
| Tools | `@function_tool` decorator | Automatic schema, type-safe |
| MCP | Built-in MCP server tool calling | Native SDK support |
| Sessions | SQLAlchemy/SQLite Sessions | Persistent conversation history |
| Guardrails | Input/Output guardrails with `@input_guardrail`, `@output_guardrail` | Safety and validation |
| Tracing | Built-in tracing (optional disabled) | Observability and debugging |
| Model Settings | `ModelSettings(temperature=0.4, max_tokens=700, tool_choice="auto")` | Fine-tuned for task management |

---

## Google Gemini Integration Reference Implementation

**Complete working example from existing implementation**:

```python
from agents import Agent, Runner, OpenAIChatCompletionsModel, function_tool
from agents import GuardrailFunctionOutput, TResponseInputItem, RunContextWrapper
from agents import input_guardrail, output_guardrail, RunConfig
from agents import InputGuardrailTripwireTriggered, OutputGuardrailTripwireTriggered
from openai import AsyncOpenAI
from .config import GEMINI_API_KEY, logger
from agents import enable_verbose_stdout_logging

# Enable verbose logging (optional)
enable_verbose_stdout_logging()

# Configure Gemini API via OpenAI-compatible endpoint
client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

# Configure model
model = OpenAIChatCompletionsModel(
    model="gemini-2.0-flash",
    openai_client=client,
)

# Run configuration (tracing disabled for production)
config = RunConfig(
    model=model,
    model_provider=client,
    tracing_disabled=True
)

# Define guardrail agent for input validation
guardrail_agent = Agent(
    name="Guardrail Agent",
    instructions=f"You are a guardrail agent that checks if the user's query is valid. The current date is {datetime.now().strftime('%Y-%m-%d')}.",
    output_type=News
)

# Input guardrail
@input_guardrail
async def news_guardrail(ctx: RunContextWrapper, agent: Agent, input: str | list):
    result = await Runner.run(guardrail_agent, input, context=ctx.context, run_config=config)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=result.final_output.is_not_news
    )

# Output guardrail
@output_guardrail
async def news_output_guardrails(ctx: RunContextWrapper, agent: Agent, output):
    if isinstance(output, str):
        try:
            output = GuardrailOutput.parse_raw(output)
        except Exception as e:
            logger.error(f"Parse failed {repr(e)}")
            return GuardrailFunctionOutput(
                output_info=News(is_not_news=True, reasoning=f"Invalid output: {repr(e)}"),
                tripwire_triggered=True
            )
    
    result = await Runner.run(guardrail_output_agent, output_str, context=ctx.context, run_config=config)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=result.final_output.is_not_news
    )

# Define function tool
@function_tool
def create_task(title: str, description: str = None, due_date: str = None):
    """Create a new task in the todo app"""
    # Implementation calls existing backend API
    return {"success": True, "task_id": "..."}

# Create main agent with tools and guardrails
agent = Agent(
    name="TodoAssistant",
    instructions="You are a senior AI assistant for a production Todo app...",
    tools=[create_task, ...],  # List of function tools
    input_guardrails=[news_guardrail],  # Optional
    output_guardrails=[news_output_guardrails],  # Optional
    output_type=GuardrailOutput,
    model_settings=ModelSettings(temperature=0.4, max_tokens=700, tool_choice="auto")
)

# Run agent
result = Runner.run_sync(agent, "Create a task to buy groceries tomorrow", run_config=config)
print(result.final_output)
```

**Key Configuration Points**:
1. **Gemini API Key**: Load from environment variable `GEMINI_API_KEY`
2. **Base URL**: Use `https://generativelanguage.googleapis.com/v1beta/openai/` for OpenAI compatibility
3. **Model**: Use `gemini-2.0-flash` for best performance/cost balance
4. **Guardrails**: Optional but recommended for production (input and output validation)
5. **Model Settings**: 
   - `temperature=0.4` - Balanced creativity/accuracy for task management
   - `max_tokens=700` - Sufficient for most responses
   - `tool_choice="auto"` - Let model decide when to use tools
6. **Tracing**: Can be disabled for production (`tracing_disabled=True`)
7. **Verbose Logging**: Enable with `enable_verbose_stdout_logging()` for debugging

---

## Next Steps

1. **Phase 1**: Generate data-model.md with AI Agent entities
2. **Phase 1**: Create API contracts from tools
3. **Phase 1**: Generate quickstart.md with OpenAI Agents SDK + Gemini setup
4. **Phase 1**: Update agent context with SDK patterns
5. **Re-check Constitution Check** post-design
