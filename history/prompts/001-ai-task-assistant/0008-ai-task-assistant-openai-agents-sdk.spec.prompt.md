---
id: 0008
title: ai-task-assistant-openai-agents-sdk
stage: spec
date: 2026-02-17T00:00:00Z
surface: agent
model: qwen-coder-plus
feature: 001-ai-task-assistant
branch: 001-ai-task-assistant
user: wahaj-ali
command: Manual update - OpenAI Agents SDK integration
labels: ["openai-agents", "mcp", "sdk", "documentation", "integration"]
links:
  spec: /home/wahaj-ali/Desktop/multi-phase-todo/specs/001-ai-task-assistant/spec.md
  plan: /home/wahaj-ali/Desktop/multi-phase-todo/specs/001-ai-task-assistant/plan.md
  research: /home/wahaj-ali/Desktop/multi-phase-todo/specs/001-ai-task-assistant/research.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-ai-task-assistant/spec.md
 - specs/001-ai-task-assistant/plan.md
 - specs/001-ai-task-assistant/research.md
tests:
 - N/A - Documentation update
---

## Prompt

Update all specification documents to use OpenAI Agents Python SDK with built-in MCP support:
1. Extract documentation from OpenAI Agents Python SDK (https://openai.github.io/openai-agents-python/)
2. Update spec.md with correct SDK dependencies and patterns
3. Update plan.md with SDK integration details
4. Update research.md with complete SDK documentation
5. Replace Google Gemini references with OpenAI Agents SDK

## Response snapshot

Comprehensive update across all specification documents:

**spec.md Updates**:
- Changed dependency from `openai` to `openai-agents` (official SDK package)
- Updated LLM Integration requirements (FR-033 to FR-038):
  - FR-033: Use OpenAI Agents Python SDK exclusively
  - FR-034: Configure Agent using `Agent(name="...", instructions="...")` pattern
  - FR-035: Use `Runner.run_sync()` or `Runner.run()` for execution
  - FR-036: Leverage built-in MCP server tool calling
  - FR-037: Never expose API keys (unchanged)
  - FR-038: Follow OpenAI Agents SDK patterns
- Added OpenAI Agents SDK Reference section with documentation URL
- Added Key Features: Agent loop, MCP server tool calling, function tools, sessions, guardrails, tracing
- Added Agent and Runner configuration patterns

**plan.md Updates**:
- Updated Technical Context section
- Changed Primary Dependencies to `openai-agents` (OpenAI Agents Python SDK with built-in MCP support)
- Added comprehensive OpenAI Agents SDK Integration section:
  - Package name and installation command
  - Documentation URL
  - Key features used (agent loop, MCP, function tools, sessions, guardrails, tracing)
  - Agent pattern: `Agent(name="TodoAssistant", instructions="...")`
  - Runner pattern: `Runner.run_sync(agent, "user prompt")`
  - MCP Integration: Native MCP server support via SDK

**research.md Complete Rewrite**:
- Replaced Google Gemini research with OpenAI Agents SDK documentation
- Added 7 comprehensive research sections:
  1. OpenAI Agents Python SDK (installation, setup, hello world)
  2. MCP Integration (built-in MCP server tool calling)
  3. Agent Configuration & Execution (Agent/Runner pattern)
  4. Function Tools (@function_tool decorator)
  5. Sessions (persistent memory with multiple session types)
  6. Guardrails (input/output validation)
  7. Tracing (observability and debugging)
- Updated Technology Choices Summary table
- Added code examples for all patterns
- Included documentation URL: https://openai.github.io/openai-agents-python/

**Key Changes**:
- ✅ Removed Google Gemini references (no longer needed)
- ✅ Using official OpenAI Agents SDK (`openai-agents` package)
- ✅ Built-in MCP support (no separate MCP configuration needed)
- ✅ Agent loop handles tool invocation automatically
- ✅ Function tools with automatic schema generation
- ✅ Sessions for conversation persistence
- ✅ Guardrails for safety
- ✅ Tracing for observability

## Outcome

- ✅ Impact: All specs aligned with OpenAI Agents SDK, MCP integration documented
- 🧪 Tests: N/A - Documentation update
- 📁 Files: 3 files updated (spec.md, plan.md, research.md)
- 🔁 Next prompts: Ready to start building with OpenAI Agents SDK
- 🧠 Reflection: User explicitly requested OpenAI Agents SDK + MCP documentation - now fully integrated

## Evaluation notes (flywheel)

- Failure modes observed: None - documentation update completed successfully
- Graders run and results (PASS/FAIL): PASS - All references updated consistently
- Prompt variant (if applicable): N/A - Direct documentation update
- Next experiment: Start Phase 2 (Foundational) implementation using OpenAI Agents SDK patterns
