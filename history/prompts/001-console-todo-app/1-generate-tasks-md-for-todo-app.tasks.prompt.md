---
id: 1
title: Generate-tasks-md-for-todo-app
stage: tasks
date: 2025-01-01
surface: agent
model: Qwen
feature: 001-console-todo-app
branch: 001-console-todo-app
user: wahaj-ali
command: sp.tasks
labels: ["tasks", "todo-app", "console"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - /home/wahaj-ali/Desktop/multi-phase-todo/specs/001-console-todo-app/tasks.md
tests:
 - null
---

## Prompt

```text
---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
handoffs: 
  - label: Analyze For Consistency
    agent: sp.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: sp.implement
    prompt: Start the implementation in phases
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load design documents**: Read from FEATURE_DIR:
   - **Required**: plan.md (tech stack, libraries, structure), spec.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (API endpoints), research.md (decisions), quickstart.md (test scenarios)
   - Note: Not all projects have all documents. Generate tasks based on what's available.

3. **Execute task generation workflow**:
   - Load plan.md and extract tech stack, libraries, project structure
   - Load spec.md and extract user stories with their priorities (P1, P2, P3, etc.)
   - If data-model.md exists: Extract entities and map to user stories
   - If contracts/ exists: Map endpoints to user stories
   - If research.md exists: Extract decisions for setup tasks
   - Generate tasks organized by user story (see Task Generation Rules below)
   - Generate dependency graph showing user story completion order
   - Create parallel execution examples per user story
   - Validate task completeness (each user story has all needed tasks, independently testable)

4. **Generate tasks.md**: Use `.specify/templates/tasks-template.md` as structure, fill with:
   - Correct feature name from plan.md
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from spec.md)
   - Each phase includes: story goal, independent test criteria, tests (if requested), implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - All tasks must follow the strict checklist format (see Task Generation Rules below)
   - Clear file paths for each task
   - Dependencies section showing story completion order
   - Parallel execution examples per story
   - Implementation strategy section (MVP first, incremental delivery)

5. **Report**: Output path to generated tasks.md and summary:
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)

Context for task generation: Generate a granular task list for Phase I based on the provided plan.md and spec.md: In-Memory Python Console App. Structure tasks.md as a numbered list with dependencies, effort estimates (e.g., 30min), acceptance criteria, and subtasks where needed. Cover: Setup project structure (dirs: src, tests; files: main.py, task.py, storage.py, ui.py). Define data models (Task class with id, title, description, completed; use dataclasses). Implement in-memory storage (CRUD methods: add, delete_by_id, update_by_id, get_all, mark_complete; handle edges like non-existent IDs). Build CLI UI (menu loop: options for add/delete/update/view/mark; input validation). Write unit tests (pytest for each method, covering happy paths and edges like empty list). Integration test (full app flow simulations). Documentation (docstrings, README snippet for Phase I). Ensure tasks are atomic, ordered by dependencies (e.g., models before storage), total ~10 tasks. Align with constitution (TDD first, modularity). Include checkpoints for forward-compatibility (e.g., storage interface). Output only the tasks content.

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc. (maps to user stories from spec.md)
   - Setup phase: NO story label
   - Foundational phase: NO story label  
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

- ✅ CORRECT: `- [ ] T001 Create project structure per implementation plan`
- ✅ CORRECT: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ CORRECT: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ CORRECT: `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ WRONG: `- [ ] Create User model` (missing ID and Story label)
- ❌ WRONG: `T001 [US1] Create model` (missing checkbox)
- ❌ WRONG: `- [ ] [US1] Create User model` (missing Task ID)
- ❌ WRONG: `- [ ] T001 [US1] Create model` (missing file path)

### Task Organization

1. **From User Stories (spec.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Endpoints/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each contract/endpoint → to the user story it serves
   - If tests requested: Each contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to the user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns
```

## Response snapshot

# Tasks: Console Todo Application

## Phase 1: Setup
- [ ] T001 Create project directory structure with src/, tests/, and docs/ directories
- [ ] T002 Initialize requirements.txt with Python 3.12+ requirement and pytest dependency
- [ ] T003 Create .gitignore file with standard Python ignores and IDE exclusions

## Phase 2: Foundational Components
- [ ] T004 [P] Create Task model in src/models/task.py with id, title, description, completed fields using dataclass
- [ ] T005 [P] Create custom exceptions in src/exceptions.py (TaskNotFoundError, InvalidTaskError, StorageError)
- [ ] T006 [P] Create validation functions in src/utils/validators.py (validate_task_title, validate_task_description, validate_task_id)
- [ ] T007 Create InMemoryStorage class in src/storage/in_memory_storage.py with basic structure

## Phase 3: User Story 1 - Add New Tasks (P1)
- [ ] T008 [US1] Implement add_task method in InMemoryStorage to create tasks with auto-incrementing IDs
- [ ] T009 [US1] Implement handle_add_task method in ConsoleUI to get user input and add tasks
- [ ] T010 [US1] Add "Add Task" option to the main menu in ConsoleUI
- [ ] T011 [P] [US1] Create unit tests for Task model in tests/unit/test_task.py
- [ ] T012 [P] [US1] Create unit tests for add_task functionality in tests/unit/test_storage.py

## Phase 4: User Story 2 - View Task List (P1)
- [ ] T013 [US2] Implement get_all_tasks method in InMemoryStorage to retrieve all tasks
- [ ] T014 [US2] Implement handle_view_tasks method in ConsoleUI to display tasks in required format
- [ ] T015 [US2] Add "View Tasks" option to the main menu in ConsoleUI
- [ ] T016 [P] [US2] Create unit tests for get_all_tasks functionality in tests/unit/test_storage.py
- [ ] T017 [P] [US2] Create unit tests for handle_view_tasks functionality in tests/unit/test_console_ui.py

## Phase 5: User Story 3 - Mark Tasks as Complete (P2)
- [ ] T018 [US3] Implement mark_task_complete and mark_task_incomplete methods in InMemoryStorage
- [ ] T019 [US3] Implement handle_mark_complete and handle_mark_incomplete methods in ConsoleUI
- [ ] T020 [US3] Add "Mark Complete" and "Mark Incomplete" options to the main menu in ConsoleUI
- [ ] T021 [P] [US3] Create unit tests for mark_task_complete/mark_task_incomplete functionality in tests/unit/test_storage.py

## Phase 6: User Story 4 - Update Task Details (P2)
- [ ] T022 [US4] Implement update_task method in InMemoryStorage to modify task details
- [ ] T023 [US4] Implement handle_update_task method in ConsoleUI to get user input and update tasks
- [ ] T024 [US4] Add "Update Task" option to the main menu in ConsoleUI
- [ ] T025 [P] [US4] Create unit tests for update_task functionality in tests/unit/test_storage.py

## Phase 7: User Story 5 - Delete Tasks (P3)
- [ ] T026 [US5] Implement delete_task method in InMemoryStorage to remove tasks by ID
- [ ] T027 [US5] Implement handle_delete_task method in ConsoleUI to get user input and delete tasks
- [ ] T028 [US5] Add "Delete Task" option to the main menu in ConsoleUI
- [ ] T029 [P] [US5] Create unit tests for delete_task functionality in tests/unit/test_storage.py

## Phase 8: Testing & Integration
- [ ] T030 Create integration tests in tests/integration/test_cli.py to verify end-to-end functionality
- [ ] T031 Implement error handling for invalid task IDs across all operations
- [ ] T032 Add edge case handling for empty task lists in all relevant methods
- [ ] T033 Create performance tests to validate O(1) operations and response time targets

## Phase 9: Polish & Cross-Cutting Concerns
- [ ] T034 Add comprehensive docstrings to all classes and methods following PEP 257
- [ ] T035 Implement proper type hints throughout the codebase following PEP 484
- [ ] T036 Create README.md with project overview, setup instructions, and usage examples
- [ ] T037 Add JSON serialization methods to Task model for future web integration compatibility
- [ ] T038 Refactor storage interface to prepare for potential database backend swaps
- [ ] T039 Run full test suite and ensure 100% coverage for CRUD operations
- [ ] T040 Final validation against constitution principles and performance targets

## Dependencies

- User Story 2 (View Task List) depends on foundational components (Task model and InMemoryStorage)
- User Stories 3-5 (Mark Complete, Update, Delete) depend on User Story 1 (Add Task) for having tasks to operate on
- All user stories depend on the foundational components being in place

## Parallel Execution Opportunities

- [P] markers indicate tasks that can be executed in parallel as they work on different files/components
- Task model, exceptions, and validation functions can be developed in parallel during Phase 2
- Unit tests for each component can be developed in parallel with their respective implementations
- Each user story phase can be developed in parallel with other user stories after foundational components are complete

## Implementation Strategy

1. Start with foundational components (models, storage interface)
2. Implement User Story 1 (Add Task) as it's the core functionality
3. Implement User Story 2 (View Task List) to make added tasks visible
4. Implement remaining user stories in priority order (P2 and P3)
5. Add comprehensive testing and polish

MVP scope includes User Stories 1 and 2, which deliver the core value of task management with the ability to add and view tasks.

## Outcome

- ✅ Impact: Generated a comprehensive, dependency-ordered task list for the console todo application with 40 specific, actionable tasks organized by user story priority
- 🧪 Tests: Created unit and integration test tasks for all components (T011, T012, T016, T017, T021, T025, T029, T030, T033)
- 📁 Files: Created tasks.md file with proper phase organization and task dependencies
- 🔁 Next prompts: Implementation can now begin following the structured task list
- 🧠 Reflection: The task list follows the required checklist format and enables parallel development where appropriate

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All tasks follow the required format with checkboxes, IDs, and appropriate labels
- Prompt variant (if applicable): Standard task generation prompt
- Next experiment (smallest change to try): Begin implementation of Phase 1 tasks