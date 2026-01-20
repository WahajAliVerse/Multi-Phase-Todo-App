---
id: "0012"
title: "sp-plan-fullstack-todo-app"
stage: "plan"
date: "2026-01-13"
surface: "agent"
model: "Qwen"
feature: "001-fullstack-todo-app"
branch: "001-fullstack-todo-app"
user: "wahaj-ali"
command: "/sp.plan"
labels: ["planning", "architecture", "fullstack", "todo-app"]
links:
  spec: "/specs/001-fullstack-todo-app/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - /specs/001-fullstack-todo-app/plan.md
  - /specs/001-fullstack-todo-app/research.md
  - /specs/001-fullstack-todo-app/data-model.md
  - /specs/001-fullstack-todo-app/quickstart.md
  - /specs/001-fullstack-todo-app/contracts/api-contract.md
  - /QWEN.md
tests:
  - /specs/001-fullstack-todo-app/plan.md
  - /specs/001-fullstack-todo-app/research.md
---

## Prompt

---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs:
  - label: Create Tasks
    agent: sp.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: sp.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC and `.specify/memory/constitution.md`. Load IMPL_PLAN template (already copied).

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running the agent script
   - Re-evaluate Constitution Check post-design

4. **Stop and report**: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, and generated artifacts.

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Agent context update**:
   - Run `.specify/scripts/bash/update-agent-context.sh qwen`
   - These scripts detect which AI agent is in use
   - Update the appropriate agent-specific context file
   - Add only new technology from current plan
   - Preserve manual additions between markers

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route is automatically determined by stage:
     - `constitution` → `history/prompts/constitution/`
     - Feature stages → `history/prompts/<feature-name>/` (spec, plan, tasks, red, green, refactor, explainer, misc)
     - `general` → `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Open the file and fill remaining placeholders (YAML + body), embedding full PROMPT_TEXT (verbatim) and concise RESPONSE_TEXT.
   - If the script fails:
     - Read `.specify/templates/phr-template.prompt.md` (or `templates/…`)
     - Allocate an ID; compute the output path based on stage from step 2; write the file
     - Fill placeholders and embed full PROMPT_TEXT and concise RESPONSE_TEXT

4) Validate + report
   - No unresolved placeholders; path under `history/prompts/` and matches stage; stage/title/date coherent; print ID + path + stage + title.
   - On failure: warn, don't block. Skip only for `/sp.phr`.

## Response snapshot

## Summary of Implementation Planning

I have successfully completed the implementation planning for the Full-Stack Web Application (Phase II). Here's what was accomplished:

**Files Created/Updated:**
1. **plan.md** - Implementation plan with technical context, constitution check, and project structure
2. **research.md** - Research findings with technology decisions and rationale
3. **data-model.md** - Detailed data model with entities, relationships, and constraints
4. **contracts/api-contract.md** - API contract specification with all endpoints
5. **quickstart.md** - Quickstart guide with setup instructions
6. **QWEN.md** - Updated agent context with new technology information

**Branch:** `001-fullstack-todo-app`
**Implementation Plan Path:** `/home/wahaj-ali/Desktop/multi-phase-todo/specs/001-fullstack-todo-app/plan.md`

**Generated Artifacts:**
- research.md
- data-model.md
- quickstart.md
- contracts/api-contract.md

The plan is now ready for the next step, which would be to break it down into specific tasks using `/sp.tasks`. All constitutional requirements have been verified, and the architecture supports the required features while maintaining modularity for future phases.

## Outcome

- ✅ Impact: Successfully completed implementation planning for the Full-Stack Web Application (Phase II), generating all required design artifacts and verifying constitutional compliance.
- 🧪 Tests: All constitutional checks passed, ensuring the plan aligns with project requirements.
- 📁 Files: Created/updated 6 key files including plan, research, data model, API contracts, quickstart guide, and agent context.
- 🔁 Next prompts: Ready to proceed with `/sp.tasks` to break the plan into specific implementation tasks.
- 🧠 Reflection: The planning phase was executed successfully with all required artifacts generated. The implementation plan aligns with constitutional requirements and provides a solid foundation for the development phase.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All constitutional checks PASSED
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed with task breakdown using `/sp.tasks`
