# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an AI Task Assistant that enables natural language interactions for task management through a floating chat interface. The agent will use Google Gemini LLM with OpenAI Agents SDK compatibility to parse user intents and execute actions via 15 backend API tools (task CRUD, tag management, recurrence/scheduling). Key constraints: backend READ-ONLY (no modifications), HTTP-only cookie authentication, MCP for ambiguous reasoning, and full Redux state synchronization.

## Technical Context

**Language/Version**: Python 3.12+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI (backend), Next.js 14+ (frontend), Google Gemini via OpenAI Agents SDK
**Storage**: SQLite (development), PostgreSQL (production) - via existing backend
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web application with floating chat interface
**Project Type**: Full-stack web application (frontend + backend)
**Performance Goals**: <3s response time for chat interactions, 100 concurrent sessions, <1s Redux sync
**Constraints**: Backend READ-ONLY (no modifications), HTTP-only cookies, rate-limiting required
**Scale/Scope**: Production-grade AI agent with 15 backend API tools, MCP integration, bilingual support ready

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **I. Modularity for Phased Evolution**: AI agent designed as isolated module with clear tool interfaces, enabling independent development and testing

✅ **II. User-Centric Design**: Natural language interface reduces friction, intuitive chat UX with persistent history and real-time indicators

✅ **III. Security-First Approach**: HTTP-only cookies, rate-limiting, user data isolation, no credential exposure, backend API-only access

✅ **IV. Performance Optimization**: <3s response time goal, <1s Redux sync, 100 concurrent sessions support, efficient LLM calls

✅ **V. Accessibility Compliance**: Chat interface accessible from all pages, keyboard navigation, screen reader compatible, bilingual support ready (English/Urdu)

✅ **VI. Sustainability and Resource Efficiency**: Efficient LLM usage, rate-limiting prevents abuse, proper error handling and retry logic

**All constitution principles satisfied - GATE PASSED**

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-task-assistant/
├── plan.md              # This file (implementation plan)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (LLM integration patterns, MCP usage)
├── data-model.md        # Phase 1 output (AI Agent entities, message schema)
├── quickstart.md        # Phase 1 output (setup guide for Gemini, environment)
├── contracts/           # Phase 1 output (API tool schemas, chat endpoint)
└── tasks.md             # Phase 2 output (implementation tasks)
```

### Source Code (repository root)

```text
backend/
├── todo-backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── tasks.py          # Existing backend APIs (READ-ONLY)
│   │   ├── models/
│   │   │   └── task.py           # Existing task model (READ-ONLY)
│   │   ├── services/
│   │   │   └── task_service.py   # Existing service layer (READ-ONLY)
│   │   └── agent/                # NEW: AI Agent module
│   │       ├── __init__.py
│   │       ├── agent.py          # Gemini agent with OpenAI SDK
│   │       ├── tools/            # Tool wrappers for backend APIs
│   │       │   ├── task_tools.py
│   │       │   ├── tag_tools.py
│   │       │   └── recurrence_tools.py
│   │       ├── mcp/              # Multi-Context Provider integration
│   │       │   └── reasoning.py
│   │       └── config.py         # Gemini configuration, env loading
│   └── tests/
│       └── agent/                # Agent tests
│           ├── test_tools.py
│           └── test_agent.py

frontend/
├── components/
│   └── common/
│       ├── ChatButton.tsx        # Floating chat button
│       └── ChatModal.tsx         # Chat modal interface
├── redux/
│   └── slices/
│       └── agentChat.ts          # Chat state management
├── utils/
│   └── api.ts                    # Chat API integration
└── app/
    └── layout.tsx                # Global chat button integration

tests/
└── e2e/
    └── chat-agent.spec.ts        # End-to-end chat tests
```

**Structure Decision**: Full-stack web application structure (Option 2 variant)
- Backend: New `agent/` module isolated from existing backend (preserves READ-ONLY constraint)
- Frontend: New chat components integrated into existing component library
- Clear separation between agent logic and existing application code

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| LLM Integration (Gemini) | Core requirement for natural language understanding | Rule-based parsing insufficient for varied user expressions |
| MCP for reasoning | Required for ambiguous intent clarification | Direct tool execution would fail on ambiguous inputs |
| 15 API tools | Comprehensive task management coverage | Fewer tools would limit user capabilities |

---

## Phase Completion Status

### ✅ Phase 0: Outline & Research - COMPLETE

**Artifacts Generated**:
- [x] `research.md` - LLM integration patterns, MCP usage, date parsing, tool wrapping, Redux sync, rate limiting, error handling

**Research Questions Resolved**:
- [x] Google Gemini integration with OpenAI Agents SDK
- [x] Multi-Context Provider integration pattern
- [x] Natural language date/time parsing strategy
- [x] Backend API tool wrapping pattern
- [x] Redux state synchronization pattern
- [x] Rate limiting implementation
- [x] Error handling and retry strategy

**All NEEDS CLARIFICATION items resolved**: ✅

---

### ✅ Phase 1: Design & Contracts - COMPLETE

**Artifacts Generated**:
- [x] `data-model.md` - 8 core entities with relationships, validation rules, state machines
- [x] `contracts/api-contracts.md` - Complete API schemas for chat endpoint and 15 tools
- [x] `quickstart.md` - Setup guide for Gemini, environment configuration, testing
- [x] Agent context updated (Qwen Code)

**Design Deliverables**:
- [x] Entity definitions with attributes and relationships
- [x] API contracts for all tools (input/output schemas)
- [x] Error codes and handling patterns
- [x] Data persistence strategy (SQLite → PostgreSQL)
- [x] Integration points documented

**Agent Context Updated**: ✅
- Language: Python 3.12+, TypeScript 5.x
- Framework: FastAPI, Next.js 14+, Google Gemini via OpenAI Agents SDK
- Database: SQLite (dev), PostgreSQL (prod)

---

### ⏳ Phase 2: Implementation Planning - READY

**Next Step**: Run `/sp.tasks` to break implementation into testable tasks

**Tasks to Generate**:
1. Backend agent module setup
2. Tool wrappers implementation (15 tools)
3. MCP integration
4. Chat endpoint with rate limiting
5. Frontend chat button component
6. Frontend chat modal component
7. Redux agentChat slice
8. E2E tests

---

## Constitution Re-Check (Post-Design)

**All principles still satisfied**: ✅

- **Modularity**: Agent module isolated, clear tool interfaces
- **User-Centric**: Natural language reduces friction
- **Security**: HTTP-only cookies, rate-limiting, no credential exposure
- **Performance**: <3s response time design, efficient LLM calls
- **Accessibility**: Chat accessible from all pages, bilingual ready
- **Sustainability**: Rate-limiting prevents abuse, efficient resource usage

**GATE PASSED - Ready for Phase 2 implementation**
