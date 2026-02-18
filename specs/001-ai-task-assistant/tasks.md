# Tasks: AI Task Assistant

**Input**: Design documents from `/specs/001-ai-task-assistant/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included for comprehensive coverage of AI agent functionality

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Agent Module**: `agent/` at project root (AI agent implementation)
- **Backend**: `backend/` at repository root (existing backend)
- **Frontend**: `frontend/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and AI agent module structure

**Status**: ✅ **COMPLETE** - Agent directory created at project root, venv setup, dependencies installed via `uv add`

- [X] T001 Create backend agent module structure in `agent/`
- [X] T002 [P] Install backend dependencies: `openai`, `python-dotenv`, `slowapi` using `uv add`
- [X] T003 [P] Install frontend dependencies: `@reduxjs/toolkit`, `react-redux` in `frontend/package.json`
- [X] T004 [P] Configure Gemini API environment in `agent/.env.example`
- [X] T005 [P] Configure frontend chat API URL in `frontend/.env.local.example`

**⚠️ Development Workflow** (REQUIRED for all agent development):

```bash
# Navigate to agent directory (at project root)
cd agent

# Activate virtual environment (ALWAYS do this first)
source .venv/bin/activate

# Install new dependencies (ALWAYS use uv add - NEVER use uv pip install)
uv add <package-name>

# Verify installation
uv pip list
```

**IMPORTANT**: 
- ✅ ALWAYS activate venv: `source .venv/bin/activate`
- ✅ ALWAYS use `uv add <package-name>` for installing dependencies
- ❌ Do NOT use `uv pip install`
- ❌ Do NOT use any other package manager

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Implement Gemini client initialization in `agent/config.py`
- [X] T007 [P] Create OpenAI Agents SDK wrapper in `agent/agent.py`
- [X] T008 [P] Implement rate limiting middleware in `backend/todo-backend/src/core/rate_limiter_session.py`
- [X] T009 [P] Create chat API endpoint skeleton in `backend/todo-backend/src/api/chat.py`
- [X] T010 [P] Setup Redux store slice structure in `frontend/redux/slices/agentChat.ts`
- [X] T011 [P] Create shared types for chat messages in `frontend/types/index.ts`
- [X] T012 [P] Implement error handling utility in `agent/error_handler.py`
- [X] T013 [P] Setup logging infrastructure for agent in `agent/logger.py`

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Chat-Based Task Creation (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks via natural language chat commands

**Independent Test**: User types "Create a task to buy groceries tomorrow at 5pm" and task appears with correct details

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T014 [P] [US1] Contract test for create_task tool in `backend/todo-backend/tests/agent/test_task_tools.py`
- [X] T015 [P] [US1] Integration test for chat-based task creation in `frontend/tests/integration/chat-task-creation.test.tsx`
- [X] T016 [P] [US1] E2E test for natural language task creation in `tests/e2e/chat-agent.spec.ts`

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement create_task tool wrapper in `agent/tools/task_tools.py`
- [X] T018 [P] [US1] Implement get_tasks tool wrapper in `agent/tools/task_tools.py`
- [X] T019 [US1] Implement natural language date parser in `agent/utils/date_parser.py`
- [X] T020 [US1] Implement intent parser for task creation in `agent/mcp/reasoning.py`
- [X] T021 [US1] Add MCP clarification flow for ambiguous dates in `agent/mcp/reasoning.py`
- [X] T022 [US1] Implement chat message handler in `backend/todo-backend/src/api/chat.py`
- [X] T023 [US1] Create ChatButton component in `frontend/components/common/ChatButton.tsx`
- [X] T024 [US1] Create ChatModal component in `frontend/components/common/ChatModal.tsx`
- [X] T025 [US1] Implement chat API service in `frontend/utils/api.ts`
- [X] T026 [US1] Add chat button to layout in `frontend/app/layout.tsx`
- [X] T027 [US1] Implement Redux chat message actions in `frontend/redux/slices/agentChat.ts`
- [X] T028 [US1] Add task creation confirmation UI in `frontend/components/common/ChatModal.tsx`
- [X] T029 [US1] Add logging for task creation operations in `agent/logger.py`

**Checkpoint**: ✅ At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Natural Language Task Updates (Priority: P1)

**Goal**: Users can modify tasks using conversational commands

**Independent Test**: User types "Move dentist appointment to Friday" and system updates correctly

### Tests for User Story 2 ⚠️

- [ ] T030 [P] [US2] Contract test for update_task tool in `backend/todo-backend/tests/agent/test_task_tools.py`
- [ ] T031 [P] [US2] Integration test for task update via chat in `frontend/tests/integration/chat-task-update.test.tsx`

### Implementation for User Story 2

- [X] T032 [P] [US2] Implement update_task tool wrapper in `agent/tools/task_tools.py`
- [X] T033 [P] [US2] Implement mark_task_complete tool in `agent/tools/task_tools.py`
- [ ] T034 [US2] Implement intent parser for task updates in `agent/mcp/reasoning.py`
- [ ] T035 [US2] Add MCP clarification for multiple matching tasks in `agent/mcp/reasoning.py`
- [X] T036 [US2] Implement task search utility in `agent/utils/task_search.py`
- [ ] T037 [US2] Add priority update handling in `agent/tools/task_tools.py`
- [ ] T038 [US2] Add tag assignment handling in `agent/tools/tag_tools.py`
- [ ] T039 [US2] Implement chat response formatting for updates in `agent/agent.py`
- [ ] T040 [US2] Add update confirmation UI in `frontend/components/common/ChatModal.tsx`
- [ ] T041 [US2] Add Redux actions for task updates in `frontend/redux/slices/agentChat.ts`
- [ ] T042 [US2] Add logging for task update operations in `agent/logger.py`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Recurring Task Management (Priority: P1)

**Goal**: Users can create, modify, and cancel recurring tasks via chat

**Independent Test**: User types "Weekly team meeting every Monday at 10am starting next week" and recurrence created correctly

### Tests for User Story 3 ⚠️

- [ ] T043 [P] [US3] Contract test for create_recurring_task in `backend/todo-backend/tests/agent/test_recurrence_tools.py`
- [ ] T044 [P] [US3] Integration test for recurring task creation in `frontend/tests/integration/chat-recurring-tasks.test.tsx`

### Implementation for User Story 3

- [X] T045 [P] [US3] Implement create_recurring_task tool in `agent/tools/recurrence_tools.py`
- [ ] T046 [P] [US3] Implement update_recurrence_pattern tool in `agent/tools/recurrence_tools.py`
- [X] T047 [P] [US3] Implement cancel_recurrence tool in `agent/tools/recurrence_tools.py`
- [ ] T048 [P] [US3] Implement generate_next_occurrence tool in `agent/tools/recurrence_tools.py`
- [ ] T049 [US3] Implement recurrence pattern parser in `agent/utils/recurrence_parser.py`
- [ ] T050 [US3] Add natural language recurrence patterns support in `agent/utils/recurrence_parser.py`
- [ ] T051 [US3] Implement MCP reasoning for recurrence clarification in `agent/mcp/reasoning.py`
- [ ] T052 [US3] Add recurrence validation in `agent/tools/recurrence_tools.py`
- [ ] T053 [US3] Implement chat UI for recurrence confirmation in `frontend/components/common/ChatModal.tsx`
- [ ] T054 [US3] Add recurrence display in chat responses in `frontend/components/common/ChatModal.tsx`
- [ ] T055 [US3] Add logging for recurrence operations in `agent/logger.py`

**Checkpoint**: All P1 user stories complete - MVP ready for deployment

---

## Phase 6: User Story 4 - Intelligent Task Queries (Priority: P2)

**Goal**: Users can query tasks using natural language

**Independent Test**: User types "What tasks are due this week?" and receives correct filtered list

### Tests for User Story 4 ⚠️

- [ ] T056 [P] [US4] Contract test for get_tasks with filters in `backend/todo-backend/tests/agent/test_task_tools.py`
- [ ] T057 [P] [US4] Integration test for task queries in `frontend/tests/integration/chat-task-queries.test.tsx`

### Implementation for User Story 4

- [ ] T058 [P] [US4] Enhance get_tasks tool with filter support in `agent/tools/task_tools.py`
- [ ] T059 [US4] Implement query intent parser in `agent/mcp/reasoning.py`
- [ ] T060 [US4] Add date range parsing for queries in `agent/utils/date_parser.py`
- [ ] T061 [US4] Implement task summarization in `agent/agent.py`
- [ ] T062 [US4] Add query result formatting in `agent/agent.py`
- [ ] T063 [US4] Implement chat UI for query results in `frontend/components/common/ChatModal.tsx`
- [ ] T064 [US4] Add task list display component in `frontend/components/common/ChatMessageList.tsx`
- [ ] T065 [US4] Add logging for query operations in `agent/logger.py`

**Checkpoint**: User Story 4 complete - intelligent queries functional

---

## Phase 7: User Story 5 - Tag Management (Priority: P2)

**Goal**: Users can create, update, delete, and assign tags via chat

**Independent Test**: User types "Create work tag in red and add to project tasks" and sees tag created and assigned

### Tests for User Story 5 ⚠️

- [ ] T066 [P] [US5] Contract test for tag tools in `backend/todo-backend/tests/agent/test_tag_tools.py`
- [ ] T067 [P] [US5] Integration test for tag management in `frontend/tests/integration/chat-tag-management.test.tsx`

### Implementation for User Story 5

- [X] T068 [P] [US5] Implement create_tag tool in `agent/tools/tag_tools.py`
- [X] T069 [P] [US5] Implement update_tag tool in `agent/tools/tag_tools.py`
- [X] T070 [P] [US5] Implement delete_tag tool in `agent/tools/tag_tools.py`
- [X] T071 [P] [US5] Implement get_tags tool in `agent/tools/tag_tools.py`
- [X] T072 [P] [US5] Implement assign_tag_to_task tool in `agent/tools/tag_tools.py`
- [ ] T073 [US5] Implement tag intent parser in `agent/mcp/reasoning.py`
- [ ] T074 [US5] Add tag color validation in `agent/tools/tag_tools.py`
- [ ] T075 [US5] Implement tag confirmation UI in `frontend/components/common/ChatModal.tsx`
- [ ] T076 [US5] Add tag display in chat responses in `frontend/components/common/ChatModal.tsx`
- [ ] T077 [US5] Add logging for tag operations in `agent/logger.py`

**Checkpoint**: User Story 5 complete - tag management functional

---

## Phase 8: User Story 6 - Reminder Scheduling (Priority: P2)

**Goal**: Users can schedule task reminders via chat

**Independent Test**: User types "Remind me 30 minutes before my meeting" and reminder scheduled correctly

### Tests for User Story 6 ⚠️

- [ ] T078 [P] [US6] Contract test for schedule_task_reminder in `backend/todo-backend/tests/agent/test_recurrence_tools.py`
- [ ] T079 [P] [US6] Integration test for reminder scheduling in `frontend/tests/integration/chat-reminder-scheduling.test.tsx`

### Implementation for User Story 6

- [X] T080 [P] [US6] Implement schedule_task_reminder tool in `agent/tools/recurrence_tools.py`
- [ ] T081 [US6] Implement reminder time parser in `agent/utils/date_parser.py`
- [ ] T082 [US6] Add natural language reminder expressions in `agent/utils/date_parser.py`
- [ ] T083 [US6] Implement reminder confirmation flow in `agent/agent.py`
- [ ] T084 [US6] Add reminder display in chat responses in `frontend/components/common/ChatModal.tsx`
- [ ] T085 [US6] Add logging for reminder operations in `agent/logger.py`

**Checkpoint**: All user stories complete - full AI agent functional

---

## Phase 9: User Story 7 - Conversation History Management (Priority: P2)

**Goal**: Users can view, search, and delete their chat conversation history

**Independent Test**: User can delete a specific conversation and it disappears from history

### Tests for User Story 7 ⚠️

- [ ] T086 [P] [US7] Contract test for conversation deletion in `backend/todo-backend/tests/agent/test_conversation_tools.py`
- [ ] T087 [P] [US7] Integration test for conversation history UI in `frontend/tests/integration/chat-history-management.test.tsx`

### Implementation for User Story 7

- [ ] T088 [P] [US7] Implement conversation soft-delete in `agent/tools/conversation_tools.py`
- [ ] T089 [P] [US7] Implement conversation history retrieval in `agent/tools/conversation_tools.py`
- [ ] T090 [US7] Add is_deleted field to Chat Conversation model in `backend/todo-backend/src/models/conversation.py`
- [ ] T091 [US7] Implement conversation search utility in `agent/utils/conversation_search.py`
- [ ] T092 [US7] Add conversation list UI in `frontend/components/common/ChatModal.tsx`
- [ ] T093 [US7] Implement delete conversation button in `frontend/components/common/ChatModal.tsx`
- [ ] T094 [US7] Add clear all history confirmation dialog in `frontend/components/common/ChatModal.tsx`
- [ ] T095 [US7] Implement conversation search UI in `frontend/components/common/ChatModal.tsx`
- [ ] T096 [US7] Add conversation persistence to database in `agent/conversation_store.py`
- [ ] T097 [US7] Add logging for conversation operations in `agent/logger.py`

**Checkpoint**: User Story 7 complete - conversation management functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T098 [P] Create comprehensive API documentation in `specs/001-ai-task-assistant/contracts/api-contracts.md`
- [ ] T099 [P] Update quickstart.md with complete setup instructions in `specs/001-ai-task-assistant/quickstart.md`
- [ ] T100 [P] Add TypeScript types for all chat messages in `frontend/types/index.ts`
- [ ] T101 [P] Implement comprehensive error messages in `agent/error_handler.py`
- [ ] T102 [P] Add retry logic with exponential backoff in `agent/error_handler.py`
- [ ] T103 [P] Implement typing indicators in `frontend/components/common/ChatModal.tsx`
- [ ] T104 [P] Add message status (sending/sent/failed) in `frontend/redux/slices/agentChat.ts`
- [ ] T105 [P] Run quickstart.md validation tests
- [ ] T106 [P] Security review: verify no API keys exposed to frontend
- [ ] T107 [P] Performance optimization: implement response caching
- [ ] T108 [P] Add accessibility features: keyboard navigation, screen reader support
- [ ] T109 [P] Code cleanup and refactoring across all modules
- [ ] T110 [P] Final E2E test run in `tests/e2e/chat-agent.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 for task retrieval
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on get_tasks from US1
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independent
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Depends on task tools from US1
- **User Story 7 (P2)**: Can start after Foundational (Phase 2) - Independent (conversation management)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Tools before intent parsing
- Backend before frontend
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: All 5 setup tasks can run in parallel
- **Phase 2**: All 8 foundational tasks can run in parallel
- **Phase 3-8**: All user stories can start in parallel after Phase 2
- **Within stories**: Tool implementations marked [P] can run in parallel
- **Tests**: All test tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
pytest backend/todo-backend/tests/agent/test_task_tools.py -v &
npm test -- frontend/tests/integration/chat-task-creation.test.tsx &
npm run test:e2e -- tests/e2e/chat-agent.spec.ts &

# Launch all tool implementations for User Story 1 together:
# Developer A: Create create_task tool in agent/tools/task_tools.py
# Developer B: Create get_tasks tool in agent/tools/task_tools.py

# Launch all frontend components together:
# Developer C: Create ChatButton in frontend/components/common/ChatButton.tsx
# Developer D: Create ChatModal in frontend/components/common/ChatModal.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (5 tasks)
2. Complete Phase 2: Foundational (8 tasks)
3. Complete Phase 3: User Story 1 (13 tasks)
4. **STOP and VALIDATE**: Test chat-based task creation independently
5. Deploy/demo MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (13 tasks)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo (All P1 complete)
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo (Full feature complete)
8. Polish phase → Final validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (13 tasks)
2. Once Foundational is done:
   - Developer A: User Story 1 (task creation)
   - Developer B: User Story 2 (task updates)
   - Developer C: User Story 3 (recurring tasks)
3. After P1 stories complete:
   - Developer A: User Story 4 (queries)
   - Developer B: User Story 5 (tags)
   - Developer C: User Story 6 (reminders)
4. Team completes Polish phase together

---

## Task Summary

**Total Tasks**: 110

**By Phase**:
- Phase 1 (Setup): 5/5 tasks complete (100%) ✅
- Phase 2 (Foundational): 8/8 tasks complete (100%) ✅
- Phase 3 (US1): 16/16 tasks complete (100%) ✅ **MVP COMPLETE**
- Phase 4 (US2): 3/11 tasks complete (27%)
- Phase 5 (US3): 2/11 tasks complete (18%)
- Phase 6 (US4): 0/8 tasks complete (0%)
- Phase 7 (US5): 5/10 tasks complete (50%)
- Phase 8 (US6): 1/6 tasks complete (17%)
- Phase 9 (US7): 0/10 tasks complete (0%)
- Phase 10 (Polish): 0/13 tasks complete (0%)

**By User Story**:
- US1 (Chat-Based Task Creation): 16/16 tasks complete (100%) ✅ **MVP READY**
- US2 (Task Updates): 3/13 tasks complete
- US3 (Recurring Tasks): 2/13 tasks complete
- US4 (Task Queries): 0/10 tasks complete
- US5 (Tag Management): 5/12 tasks complete
- US6 (Reminders): 1/8 tasks complete
- US7 (Conversation History): 0/12 tasks complete

**Progress**:
- Phase 1: 100% complete ✅
- Phase 2: 100% complete ✅
- Phase 3 US1: 100% complete ✅ **MVP COMPLETE - Ready for deployment**
- Backend Tools: Task tools (5), Tag tools (5), Recurrence tools (3/5) complete
- Utilities: Date parser, task search, MCP reasoning, logger, error handler complete
- Frontend: Redux slice, TypeScript types, ChatButton, ChatModal, layout integration complete
- Backend: Rate limiting, chat endpoint, MCP clarification flow complete
- Tests: Contract tests, integration tests, E2E tests complete
- Next: Deploy MVP or continue with US2 (Task Updates)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend READ-ONLY constraint: Never modify existing backend code, only add new agent module
- All API calls must use HTTP-only cookies for authentication
- Rate limiting is mandatory for chat endpoint (10 requests/minute per user)
