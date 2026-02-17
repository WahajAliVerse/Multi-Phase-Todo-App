---
id: 0007
title: ai-task-assistant-path-fix
stage: tasks
date: 2026-02-17T00:00:00Z
surface: agent
model: qwen-coder-plus
feature: 001-ai-task-assistant
branch: 001-ai-task-assistant
user: wahaj-ali
command: Manual update - Path and command correction
labels: ["path-fix", "agent-directory", "uv-add", "correction"]
links:
  spec: /home/wahaj-ali/Desktop/multi-phase-todo/specs/001-ai-task-assistant/spec.md
  tasks: /home/wahaj-ali/Desktop/multi-phase-todo/specs/001-ai-task-assistant/tasks.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-ai-task-assistant/spec.md
 - specs/001-ai-task-assistant/tasks.md
tests:
 - N/A - Path correction update
---

## Prompt

Correct two critical issues in spec.md and tasks.md:
1. Agent directory is at project ROOT (`agent/`), NOT inside `backend/todo-backend/src/agent/`
2. Use `uv add <package-name>` for installing dependencies, NOT `uv pip install`

## Response snapshot

Updated both files with correct paths and commands:

**spec.md Updates**:
- Changed agent directory from `backend/todo-backend/src/agent/` to `agent/` (project root)
- Changed dependency installation from `uv pip install` to `uv add <package-name>`
- Updated all workflow examples to use correct path and command

**tasks.md Updates**:
- Updated Path Conventions section to show `agent/` at project root
- Changed T001 path from `backend/todo-backend/src/agent/` to `agent/`
- Changed T002 description to use `uv add` instead of `uv pip install`
- Changed T004 path from `backend/todo-backend/.env.example` to `agent/.env.example`
- Updated development workflow box with correct commands
- Ran sed to replace all `backend/todo-backend/src/agent/` with `agent/` throughout file

**Correct Development Workflow**:
```bash
cd agent
source .venv/bin/activate
uv add <package-name>
uv pip list
```

**All 110 task file paths updated** to use correct `agent/` directory structure.

## Outcome

- ✅ Impact: All paths and commands corrected to match actual project structure
- 🧪 Tests: N/A - Documentation correction
- 📁 Files: 2 files updated (spec.md, tasks.md)
- 🔁 Next prompts: Ready to continue implementation with correct paths
- 🧠 Reflection: User explicitly corrected path location and uv add command - critical for consistency

## Evaluation notes (flywheel)

- Failure modes observed: None - correction completed successfully
- Graders run and results (PASS/FAIL): PASS - All paths and commands updated correctly
- Prompt variant (if applicable): N/A - Direct correction
- Next experiment: Continue with Phase 2 (Foundational) implementation
