---
id: "001"
title: "Create Frontend Debug Fixes Specification"
stage: "spec"
date_iso: "2026-02-09"
surface: "agent"
model: "openai/gpt-4o"
feature: "frontend-debug-fixes"
branch: "004-frontend-debug-fixes"
command: ".specify/scripts/bash/create-new-feature.sh --json \"Role: You are a senior frontend engineer specializing in precise, production-grade debugging for Next.js applications. Your focus is on surgical fixes to resolve specific issues while preserving the existing architecture. Project Context: The frontend is an existing, mostly functional Next.js App Router app with TypeScript, Tailwind CSS, Redux Toolkit (async thunks), React Hook Form + Zod, and toast notifications. The backend (FastAPI + SQLModel + Neon DB) uses HTTP-only cookie authentication and is fully operational—treat as read-only; do not modify or access beyond API calls. Core Directive: Apply only minimal changes to fix the listed issues. Do not refactor, redesign, or alter the overall structure, UI, or state management. Maintain production safety and avoid regressions. Issues to Fix (Address ONLY These): Target each issue with isolated fixes. Verify backend behavior (e.g., via API docs or Postman) to ensure frontend alignment without assumptions. Tags Not Rendering in UI: Symptoms: Backend API endpoints return tags correctly (e.g., via GET /tags), but they do not appear in the task create modal or task list components. Root Cause Analysis: Likely mismatches in API response typing, Redux state mapping, or component rendering logic. Fixes (Minimal Changes Only): Ensure TypeScript interfaces/types for API responses match backend (e.g., tags as { id: string; name: string; color: string; }[]). Update types in relevant files (e.g., types/api.ts) if mismatched. Audit Redux tags slice: Verify async thunk fetches and stores tags properly (e.g., in extraReducers for fulfilled state). Fix selectors: Use createSelector from reselect if needed for memoized access; ensure components use useSelector to pull tags by id/name/color. In components (e.g., TaskModal.tsx, TaskList.tsx): Map tags correctly in UI (e.g., render as chips with color styles via Tailwind). Add conditional checks for empty arrays to avoid errors. No UI redesign: Just enable existing rendering logic (e.g., uncomment or fix loops like {tags.map(tag => <TagChip key={tag.id} ... />)}). Invalid Datetime/ISO Error in Task Create Modal: Symptoms: Date picker (e.g., react-datepicker or similar) is integrated, but form submission triggers backend validation errors for invalid ISO 8601 datetime format. Root Cause Analysis: Likely improper date conversion in form payload before API submission. Fixes (Minimal Changes Only): In form handling (React Hook Form onSubmit): Convert selected date to ISO 8601 string (e.g., new Date(value).toISOString()). Handle timezone offsets safely (e.g., use date-fns or native Date if already imported; add date-fns via Bun if missing, but prefer existing utils). Update Zod schema if needed: Ensure dueDate field parses as z.string().datetime({ offset: true }) for ISO compliance. Fix payload transformation: In async thunk (e.g., createTaskThunk), shape request body with corrected datetime (e.g., { ...formData, dueDate: formatISO(formData.dueDate) }). Test edge cases: Empty dates, different timezones, invalid inputs—show toast errors without locking UI. Do not alter backend rules. User ID Not Attached in Tag Creation Requests: Symptoms: Tag creation API (e.g., POST /tags) requires user_id but fails due to missing field in frontend payload. Root Cause Analysis: Frontend omits auto-attaching authenticated user's ID. Fixes (Minimal Changes Only): Pull user from Redux: Use useSelector or selector to get auth.user.id from auth slice. In async thunk (e.g., createTagThunk): Automatically add user_id to payload (e.g., { ...tagData, user_id: getState().auth.user.id }). Preserve auth: Rely on HTTP-only cookies for authentication—no token manipulation or localStorage. Test: Verify request body in dev tools network tab; ensure creation succeeds and tags associate correctly. User Data Not Persisting on Refresh/Navigation: Symptoms: User session/data sometimes lost on page refresh or route changes, leading to re-auth prompts. Root Cause Analysis: Incomplete hydration of Redux auth state on app init. Fixes (Minimal Changes Only): On app load: In root layout or _app.tsx, dispatch a thunk to call /me (or equivalent auth check endpoint) if auth state is empty (e.g., via useEffect with useDispatch). Hydrate Redux: Update auth slice to handle fulfilled state from the thunk, setting user object persistently. Use Redux middleware if needed for auto-fetch on mount. No storage changes: Stick to cookies for auth; do not introduce localStorage or Persist. Test: Refresh page, navigate routes—user data should reload seamlessly without full logout. CORS Issues with API Requests: Symptoms: API calls (e.g., fetch to backend endpoints) fail with CORS errors in console/dev tools, preventing data flow despite backend CORS being configured correctly. Root Cause Analysis: Likely missing or incorrect request options in frontend API client (e.g., no credentials: 'include' or improper mode/origin handling). Fixes (Minimal Changes Only): Centralize and update API wrapper (e.g., in utils/api.ts): Ensure all fetch/axios calls include { credentials: 'include', mode: 'cors' } to handle cookies and cross-origin requests. Verify headers: Add necessary headers if missing (e.g., Accept: 'application/json'), but only if backend requires them—check via network tab. Handle preflight: Ensure OPTIONS requests succeed by aligning with backend allowances; no backend changes. Test edge cases: Cross-domain dev setups, auth-required endpoints, large payloads—show toast errors for failures without UI lockup. Preserve cookie auth integrity. Strict Constraints: Do NOT: Change existing pages, components, or folder structure. Do NOT: Redesign UI elements, layouts, or styles. Do NOT: Refactor Redux (e.g., no new slices, middleware, or patterns). Do NOT: Introduce new libraries/state managers (e.g., no Zustand, Context API). Do NOT: Modify backend code, endpoints, or validation. Do NOT: Break working features (e.g., task CRUD, modals, themes)—test pre/post-fix. General: Keep changes minimal; prefer inline fixes over new files. Allowed Changes: Update Redux slice logic (e.g., reducers, thunks) for the specific issues. Adjust selectors for accurate data access. Modify API request payloads (e.g., add fields, format dates). Add small utility functions (e.g., date formatter in utils/date.ts) if essential. Insert console logs for debugging (remove before final build). Ensure TypeScript compliance and error handling (e.g., try-catch in thunks). Debugging & Implementation Approach: Step-by-Step Flow: Reproduce each issue locally (e.g., via bun run dev). Inspect: Use Redux DevTools for state, browser network tab for API calls (including CORS headers), console for errors. Fix one issue at a time: Start with auth persistence (issue 4), then user_id attachment (3), datetime (2), tags rendering (1), and finally CORS (5). Verify: Test fixes in isolation and combined (e.g., create tag → assign to task → refresh; simulate CORS in dev proxy if needed). Edge Cases: Handle empty data, network failures, invalid inputs, cross-origin mismatches—use toasts for feedback. Testing Guidelines: Manual E2E (e.g., login, create task/tag, refresh, API calls across routes); unit test thunks if existing setup allows. Run bun lint and bun test if configured. Simulate CORS errors (e.g., via browser extensions) to confirm resolution. Build Validation: Ensure bun build completes without errors; check for production optimizations (e.g., no dev-only logs, minified bundles). Expected Output & Deliverables: Functional Outcomes: Tags visible in task create modal and list (using id/name/color). Task creation succeeds without ISO datetime errors. Tags created with proper user_id association. User data persists reliably across refreshes/navigation. CORS issues resolved: All API requests succeed without cross-origin errors, preserving cookie auth. No regressions in other features (e.g., login, task list, modals). Deliverables: Provide modified code snippets/files (e.g., diffs or full updates) for affected areas (e.g., slices, components, thunks, API utils). Quality Goals: Production-safe, bug-free fixes; app remains modern, responsive, and secure. Deploy-ready (e.g., Vercel-compatible).\" --number 4 --short-name \"frontend-debug-fixes\""
labels: ["specification", "frontend", "debugging", "bug-fixes"]
links:
  spec: "/home/wahaj-ali/Desktop/multi-phase-todo/specs/004-frontend-debug-fixes/spec.md"
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "/home/wahaj-ali/Desktop/multi-phase-todo/specs/004-frontend-debug-fixes/spec.md"
  - "/home/wahaj-ali/Desktop/multi-phase-todo/specs/004-frontend-debug-fixes/checklists/requirements.md"
tests_yaml: []
prompt_text: |
  $ARGUMENTS

  You **MUST** consider the user input before proceeding (if not empty).

  ## Outline

  The text the user typed after `/sp.specify` in the triggering message **is** the feature description. Assume you always have it available in this conversation even if `Role: You are a senior frontend engineer specializing in precise, production-grade debugging for Next.js applications. Your focus is on surgical fixes to resolve specific issues while preserving the existing architecture. Project Context: The frontend is an existing, mostly functional Next.js App Router app with TypeScript, Tailwind CSS, Redux Toolkit (async thunks), React Hook Form + Zod, and toast notifications. The backend (FastAPI + SQLModel + Neon DB) uses HTTP-only cookie authentication and is fully operational—treat as read-only; do not modify or access beyond API calls. Core Directive: Apply only minimal changes to fix the listed issues. Do not refactor, redesign, or alter the overall structure, UI, or state management. Maintain production safety and avoid regressions. Issues to Fix (Address ONLY These): Target each issue with isolated fixes. Verify backend behavior (e.g., via API docs or Postman) to ensure frontend alignment without assumptions. Tags Not Rendering in UI: Symptoms: Backend API endpoints return tags correctly (e.g., via GET /tags), but they do not appear in the task create modal or task list components. Root Cause Analysis: Likely mismatches in API response typing, Redux state mapping, or component rendering logic. Fixes (Minimal Changes Only): Ensure TypeScript interfaces/types for API responses match backend (e.g., tags as { id: string; name: string; color: string; }[]). Update types in relevant files (e.g., types/api.ts) if mismatched. Audit Redux tags slice: Verify async thunk fetches and stores tags properly (e.g., in extraReducers for fulfilled state). Fix selectors: Use createSelector from reselect if needed for memoized access; ensure components use useSelector to pull tags by id/name/color. In components (e.g., TaskModal.tsx, TaskList.tsx): Map tags correctly in UI (e.g., render as chips with color styles via Tailwind). Add conditional checks for empty arrays to avoid errors. No UI redesign: Just enable existing rendering logic (e.g., uncomment or fix loops like {tags.map(tag => <TagChip key={tag.id} ... />)}). Invalid Datetime/ISO Error in Task Create Modal: Symptoms: Date picker (e.g., react-datepicker or similar) is integrated, but form submission triggers backend validation errors for invalid ISO 8601 datetime format. Root Cause Analysis: Likely improper date conversion in form payload before API submission. Fixes (Minimal Changes Only): In form handling (React Hook Form onSubmit): Convert selected date to ISO 8601 string (e.g., new Date(value).toISOString()). Handle timezone offsets safely (e.g., use date-fns or native Date if already imported; add date-fns via Bun if missing, but prefer existing utils). Update Zod schema if needed: Ensure dueDate field parses as z.string().datetime({ offset: true }) for ISO compliance. Fix payload transformation: In async thunk (e.g., createTaskThunk), shape request body with corrected datetime (e.g., { ...formData, dueDate: formatISO(formData.dueDate) }). Test edge cases: Empty dates, different timezones, invalid inputs—show toast errors without locking UI. Do not alter backend rules. User ID Not Attached in Tag Creation Requests: Symptoms: Tag creation API (e.g., POST /tags) requires user_id but fails due to missing field in frontend payload. Root Cause Analysis: Frontend omits auto-attaching authenticated user's ID. Fixes (Minimal Changes Only): Pull user from Redux: Use useSelector or selector to get auth.user.id from auth slice. In async thunk (e.g., createTagThunk): Automatically add user_id to payload (e.g., { ...tagData, user_id: getState().auth.user.id }). Preserve auth: Rely on HTTP-only cookies for authentication—no token manipulation or localStorage. Test: Verify request body in dev tools network tab; ensure creation succeeds and tags associate correctly. User Data Not Persisting on Refresh/Navigation: Symptoms: User session/data sometimes lost on page refresh or route changes, leading to re-auth prompts. Root Cause Analysis: Incomplete hydration of Redux auth state on app init. Fixes (Minimal Changes Only): On app load: In root layout or _app.tsx, dispatch a thunk to call /me (or equivalent auth check endpoint) if auth state is empty (e.g., via useEffect with useDispatch). Hydrate Redux: Update auth slice to handle fulfilled state from the thunk, setting user object persistently. Use Redux middleware if needed for auto-fetch on mount. No storage changes: Stick to cookies for auth; do not introduce localStorage or Persist. Test: Refresh page, navigate routes—user data should reload seamlessly without full logout. CORS Issues with API Requests: Symptoms: API calls (e.g., fetch to backend endpoints) fail with CORS errors in console/dev tools, preventing data flow despite backend CORS being configured correctly. Root Cause Analysis: Likely missing or incorrect request options in frontend API client (e.g., no credentials: 'include' or improper mode/origin handling). Fixes (Minimal Changes Only): Centralize and update API wrapper (e.g., in utils/api.ts): Ensure all fetch/axios calls include { credentials: 'include', mode: 'cors' } to handle cookies and cross-origin requests. Verify headers: Add necessary headers if missing (e.g., Accept: 'application/json'), but only if backend requires them—check via network tab. Handle preflight: Ensure OPTIONS requests succeed by aligning with backend allowances; no backend changes. Test edge cases: Cross-domain dev setups, auth-required endpoints, large payloads—show toast errors for failures without UI lockup. Preserve cookie auth integrity. Strict Constraints: Do NOT: Change existing pages, components, or folder structure. Do NOT: Redesign UI elements, layouts, or styles. Do NOT: Refactor Redux (e.g., no new slices, middleware, or patterns). Do NOT: Introduce new libraries/state managers (e.g., no Zustand, Context API). Do NOT: Modify backend code, endpoints, or validation. Do NOT: Break working features (e.g., task CRUD, modals, themes)—test pre/post-fix. General: Keep changes minimal; prefer inline fixes over new files. Allowed Changes: Update Redux slice logic (e.g., reducers, thunks) for the specific issues. Adjust selectors for accurate data access. Modify API request payloads (e.g., add fields, format dates). Add small utility functions (e.g., date formatter in utils/date.ts) if essential. Insert console logs for debugging (remove before final build). Ensure TypeScript compliance and error handling (e.g., try-catch in thunks). Debugging & Implementation Approach: Step-by-Step Flow: Reproduce each issue locally (e.g., via bun run dev). Inspect: Use Redux DevTools for state, browser network tab for API calls (including CORS headers), console for errors. Fix one issue at a time: Start with auth persistence (issue 4), then user_id attachment (3), datetime (2), tags rendering (1), and finally CORS (5). Verify: Test fixes in isolation and combined (e.g., create tag → assign to task → refresh; simulate CORS in dev proxy if needed). Edge Cases: Handle empty data, network failures, invalid inputs, cross-origin mismatches—use toasts for feedback. Testing Guidelines: Manual E2E (e.g., login, create task/tag, refresh, API calls across routes); unit test thunks if existing setup allows. Run bun lint and bun test if configured. Simulate CORS errors (e.g., via browser extensions) to confirm resolution. Build Validation: Ensure bun build completes without errors; check for production optimizations (e.g., no dev-only logs, minified bundles). Expected Output & Deliverables: Functional Outcomes: Tags visible in task create modal and list (using id/name/color). Task creation succeeds without ISO datetime errors. Tags created with proper user_id association. User data persists reliably across refreshes/navigation. CORS issues resolved: All API requests succeed without cross-origin errors, preserving cookie auth. No regressions in other features (e.g., login, task list, modals). Deliverables: Provide modified code snippets/files (e.g., diffs or full updates) for affected areas (e.g., slices, components, thunks, API utils). Quality Goals: Production-safe, bug-free fixes; app remains modern, responsive, and secure. Deploy-ready (e.g., Vercel-compatible).` appears literally below. Do not ask the user to repeat it unless they provided an empty command.

  Given that feature description, do this:

  1. **Generate a concise short name** (2-4 words) for the branch:
     - Analyze the feature description and extract the most meaningful keywords
     - Create a 2-4 word short name that captures the essence of the feature
     - Use action-noun format when possible (e.g., "add-user-auth", "fix-payment-bug")
     - Preserve technical terms and acronyms (OAuth2, API, JWT, etc.)
     - Keep it concise but descriptive enough to understand the feature at a glance
     - Examples:
       - "I want to add user authentication" → "user-auth"
       - "Implement OAuth2 integration for the API" → "oauth2-api-integration"
       - "Create a dashboard for analytics" → "analytics-dashboard"
       - "Fix payment processing timeout bug" → "fix-payment-timeout"

  2. **Check for existing branches before creating new one**:

     a. First, fetch all remote branches to ensure we have the latest information:

        ```bash
        git fetch --all --prune
        ```

     b. Find the highest feature number across all sources for the short-name:
        - Remote branches: `git ls-remote --heads origin | grep -E 'refs/heads/[0-9]+-<short-name>$'`
        - Local branches: `git branch | grep -E '^[* ]*[0-9]+-<short-name>$'`
        - Specs directories: Check for directories matching `specs/[0-9]+-<short-name>`

     c. Determine the next available number:
        - Extract all numbers from all three sources
        - Find the highest number N
        - Use N+1 for the new branch number

     d. Run the script `.specify/scripts/bash/create-new-feature.sh --json "Role: You are a senior frontend engineer specializing in precise, production-grade debugging for Next.js applications. Your focus is on surgical fixes to resolve specific issues while preserving the existing architecture. Project Context: The frontend is an existing, mostly functional Next.js App Router app with TypeScript, Tailwind CSS, Redux Toolkit (async thunks), React Hook Form + Zod, and toast notifications. The backend (FastAPI + SQLModel + Neon DB) uses HTTP-only cookie authentication and is fully operational—treat as read-only; do not modify or access beyond API calls. Core Directive: Apply only minimal changes to fix the listed issues. Do not refactor, redesign, or alter the overall structure, UI, or state management. Maintain production safety and avoid regressions. Issues to Fix (Address ONLY These): Target each issue with isolated fixes. Verify backend behavior (e.g., via API docs or Postman) to ensure frontend alignment without assumptions. Tags Not Rendering in UI: Symptoms: Backend API endpoints return tags correctly (e.g., via GET /tags), but they do not appear in the task create modal or task list components. Root Cause Analysis: Likely mismatches in API response typing, Redux state mapping, or component rendering logic. Fixes (Minimal Changes Only): Ensure TypeScript interfaces/types for API responses match backend (e.g., tags as { id: string; name: string; color: string; }[]). Update types in relevant files (e.g., types/api.ts) if mismatched. Audit Redux tags slice: Verify async thunk fetches and stores tags properly (e.g., in extraReducers for fulfilled state). Fix selectors: Use createSelector from reselect if needed for memoized access; ensure components use useSelector to pull tags by id/name/color. In components (e.g., TaskModal.tsx, TaskList.tsx): Map tags correctly in UI (e.g., render as chips with color styles via Tailwind). Add conditional checks for empty arrays to avoid errors. No UI redesign: Just enable existing rendering logic (e.g., uncomment or fix loops like {tags.map(tag => <TagChip key={tag.id} ... />)}). Invalid Datetime/ISO Error in Task Create Modal: Symptoms: Date picker (e.g., react-datepicker or similar) is integrated, but form submission triggers backend validation errors for invalid ISO 8601 datetime format. Root Cause Analysis: Likely improper date conversion in form payload before API submission. Fixes (Minimal Changes Only): In form handling (React Hook Form onSubmit): Convert selected date to ISO 8601 string (e.g., new Date(value).toISOString()). Handle timezone offsets safely (e.g., use date-fns or native Date if already imported; add date-fns via Bun if missing, but prefer existing utils). Update Zod schema if needed: Ensure dueDate field parses as z.string().datetime({ offset: true }) for ISO compliance. Fix payload transformation: In async thunk (e.g., createTaskThunk), shape request body with corrected datetime (e.g., { ...formData, dueDate: formatISO(formData.dueDate) }). Test edge cases: Empty dates, different timezones, invalid inputs—show toast errors without locking UI. Do not alter backend rules. User ID Not Attached in Tag Creation Requests: Symptoms: Tag creation API (e.g., POST /tags) requires user_id but fails due to missing field in frontend payload. Root Cause Analysis: Frontend omits auto-attaching authenticated user's ID. Fixes (Minimal Changes Only): Pull user from Redux: Use useSelector or selector to get auth.user.id from auth slice. In async thunk (e.g., createTagThunk): Automatically add user_id to payload (e.g., { ...tagData, user_id: getState().auth.user.id }). Preserve auth: Rely on HTTP-only cookies for authentication—no token manipulation or localStorage. Test: Verify request body in dev tools network tab; ensure creation succeeds and tags associate correctly. User Data Not Persisting on Refresh/Navigation: Symptoms: User session/data sometimes lost on page refresh or route changes, leading to re-auth prompts. Root Cause Analysis: Incomplete hydration of Redux auth state on app init. Fixes (Minimal Changes Only): On app load: In root layout or _app.tsx, dispatch a thunk to call /me (or equivalent auth check endpoint) if auth state is empty (e.g., via useEffect with useDispatch). Hydrate Redux: Update auth slice to handle fulfilled state from the thunk, setting user object persistently. Use Redux middleware if needed for auto-fetch on mount. No storage changes: Stick to cookies for auth; do not introduce localStorage or Persist. Test: Refresh page, navigate routes—user data should reload seamlessly without full logout. CORS Issues with API Requests: Symptoms: API calls (e.g., fetch to backend endpoints) fail with CORS errors in console/dev tools, preventing data flow despite backend CORS being configured correctly. Root Cause Analysis: Likely missing or incorrect request options in frontend API client (e.g., no credentials: 'include' or improper mode/origin handling). Fixes (Minimal Changes Only): Centralize and update API wrapper (e.g., in utils/api.ts): Ensure all fetch/axios calls include { credentials: 'include', mode: 'cors' } to handle cookies and cross-origin requests. Verify headers: Add necessary headers if missing (e.g., Accept: 'application/json'), but only if backend requires them—check via network tab. Handle preflight: Ensure OPTIONS requests succeed by aligning with backend allowances; no backend changes. Test edge cases: Cross-domain dev setups, auth-required endpoints, large payloads—show toast errors for failures without UI lockup. Preserve cookie auth integrity. Strict Constraints: Do NOT: Change existing pages, components, or folder structure. Do NOT: Redesign UI elements, layouts, or styles. Do NOT: Refactor Redux (e.g., no new slices, middleware, or patterns). Do NOT: Introduce new libraries/state managers (e.g., no Zustand, Context API). Do NOT: Modify backend code, endpoints, or validation. Do NOT: Break working features (e.g., task CRUD, modals, themes)—test pre/post-fix. General: Keep changes minimal; prefer inline fixes over new files. Allowed Changes: Update Redux slice logic (e.g., reducers, thunks) for the specific issues. Adjust selectors for accurate data access. Modify API request payloads (e.g., add fields, format dates). Add small utility functions (e.g., date formatter in utils/date.ts) if essential. Insert console logs for debugging (remove before final build). Ensure TypeScript compliance and error handling (e.g., try-catch in thunks). Debugging & Implementation Approach: Step-by-Step Flow: Reproduce each issue locally (e.g., via bun run dev). Inspect: Use Redux DevTools for state, browser network tab for API calls (including CORS headers), console for errors. Fix one issue at a time: Start with auth persistence (issue 4), then user_id attachment (3), datetime (2), tags rendering (1), and finally CORS (5). Verify: Test fixes in isolation and combined (e.g., create tag → assign to task → refresh; simulate CORS in dev proxy if needed). Edge Cases: Handle empty data, network failures, invalid inputs, cross-origin mismatches—use toasts for feedback. Testing Guidelines: Manual E2E (e.g., login, create task/tag, refresh, API calls across routes); unit test thunks if existing setup allows. Run bun lint and bun test if configured. Simulate CORS errors (e.g., via browser extensions) to confirm resolution. Build Validation: Ensure bun build completes without errors; check for production optimizations (e.g., no dev-only logs, minified bundles). Expected Output & Deliverables: Functional Outcomes: Tags visible in task create modal and list (using id/name/color). Task creation succeeds without ISO datetime errors. Tags created with proper user_id association. User data persists reliably across refreshes/navigation. CORS issues resolved: All API requests succeed without cross-origin errors, preserving cookie auth. No regressions in other features (e.g., login, task list, modals). Deliverables: Provide modified code snippets/files (e.g., diffs or full updates) for affected areas (e.g., slices, components, thunks, API utils). Quality Goals: Production-safe, bug-free fixes; app remains modern, responsive, and secure. Deploy-ready (e.g., Vercel-compatible)." --json --number N+1 and short-name:
        - Pass `--number N+1` and `--short-name "your-short-name"` along with the feature description
        - Bash example: `.specify/scripts/bash/create-new-feature.sh --json "Role: You are a senior frontend engineer specializing in precise, production-grade debugging for Next.js applications. Your focus is on surgical fixes to resolve specific issues while preserving the existing architecture. Project Context: The frontend is an existing, mostly functional Next.js App Router app with TypeScript, Tailwind CSS, Redux Toolkit (async thunks), React Hook Form + Zod, and toast notifications. The backend (FastAPI + SQLModel + Neon DB) uses HTTP-only cookie authentication and is fully operational—treat as read-only; do not modify or access beyond API calls. Core Directive: Apply only minimal changes to fix the listed issues. Do not refactor, redesign, or alter the overall structure, UI, or state management. Maintain production safety and avoid regressions. Issues to Fix (Address ONLY These): Target each issue with isolated fixes. Verify backend behavior (e.g., via API docs or Postman) to ensure frontend alignment without assumptions. Tags Not Rendering in UI: Symptoms: Backend API endpoints return tags correctly (e.g., via GET /tags), but they do not appear in the task create modal or task list components. Root Cause Analysis: Likely mismatches in API response typing, Redux state mapping, or component rendering logic. Fixes (Minimal Changes Only): Ensure TypeScript interfaces/types for API responses match backend (e.g., tags as { id: string; name: string; color: string; }[]). Update types in relevant files (e.g., types/api.ts) if mismatched. Audit Redux tags slice: Verify async thunk fetches and stores tags properly (e.g., in extraReducers for fulfilled state). Fix selectors: Use createSelector from reselect if needed for memoized access; ensure components use useSelector to pull tags by id/name/color. In components (e.g., TaskModal.tsx, TaskList.tsx): Map tags correctly in UI (e.g., render as chips with color styles via Tailwind). Add conditional checks for empty arrays to avoid errors. No UI redesign: Just enable existing rendering logic (e.g., uncomment or fix loops like {tags.map(tag => <TagChip key={tag.id} ... />)}). Invalid Datetime/ISO Error in Task Create Modal: Symptoms: Date picker (e.g., react-datepicker or similar) is integrated, but form submission triggers backend validation errors for invalid ISO 8601 datetime format. Root Cause Analysis: Likely improper date conversion in form payload before API submission. Fixes (Minimal Changes Only): In form handling (React Hook Form onSubmit): Convert selected date to ISO 8601 string (e.g., new Date(value).toISOString()). Handle timezone offsets safely (e.g., use date-fns or native Date if already imported; add date-fns via Bun if missing, but prefer existing utils). Update Zod schema if needed: Ensure dueDate field parses as z.string().datetime({ offset: true }) for ISO compliance. Fix payload transformation: In async thunk (e.g., createTaskThunk), shape request body with corrected datetime (e.g., { ...formData, dueDate: formatISO(formData.dueDate) }). Test edge cases: Empty dates, different timezones, invalid inputs—show toast errors without locking UI. Do not alter backend rules. User ID Not Attached in Tag Creation Requests: Symptoms: Tag creation API (e.g., POST /tags) requires user_id but fails due to missing field in frontend payload. Root Cause Analysis: Frontend omits auto-attaching authenticated user's ID. Fixes (Minimal Changes Only): Pull user from Redux: Use useSelector or selector to get auth.user.id from auth slice. In async thunk (e.g., createTagThunk): Automatically add user_id to payload (e.g., { ...tagData, user_id: getState().auth.user.id }). Preserve auth: Rely on HTTP-only cookies for authentication—no token manipulation or localStorage. Test: Verify request body in dev tools network tab; ensure creation succeeds and tags associate correctly. User Data Not Persisting on Refresh/Navigation: Symptoms: User session/data sometimes lost on page refresh or route changes, leading to re-auth prompts. Root Cause Analysis: Incomplete hydration of Redux auth state on app init. Fixes (Minimal Changes Only): On app load: In root layout or _app.tsx, dispatch a thunk to call /me (or equivalent auth check endpoint) if auth state is empty (e.g., via useEffect with useDispatch). Hydrate Redux: Update auth slice to handle fulfilled state from the thunk, setting user object persistently. Use Redux middleware if needed for auto-fetch on mount. No storage changes: Stick to cookies for auth; do not introduce localStorage or Persist. Test: Refresh page, navigate routes—user data should reload seamlessly without full logout. CORS Issues with API Requests: Symptoms: API calls (e.g., fetch to backend endpoints) fail with CORS errors in console/dev tools, preventing data flow despite backend CORS being configured correctly. Root Cause Analysis: Likely missing or incorrect request options in frontend API client (e.g., no credentials: 'include' or improper mode/origin handling). Fixes (Minimal Changes Only): Centralize and update API wrapper (e.g., in utils/api.ts): Ensure all fetch/axios calls include { credentials: 'include', mode: 'cors' } to handle cookies and cross-origin requests. Verify headers: Add necessary headers if missing (e.g., Accept: 'application/json'), but only if backend requires them—check via network tab. Handle preflight: Ensure OPTIONS requests succeed by aligning with backend allowances; no backend changes. Test edge cases: Cross-domain dev setups, auth-required endpoints, large payloads—show toast errors for failures without UI lockup. Preserve cookie auth integrity. Strict Constraints: Do NOT: Change existing pages, components, or folder structure. Do NOT: Redesign UI elements, layouts, or styles. Do NOT: Refactor Redux (e.g., no new slices, middleware, or patterns). Do NOT: Introduce new libraries/state managers (e.g., no Zustand, Context API). Do NOT: Modify backend code, endpoints, or validation. Do NOT: Break working features (e.g., task CRUD, modals, themes)—test pre/post-fix. General: Keep changes minimal; prefer inline fixes over new files. Allowed Changes: Update Redux slice logic (e.g., reducers, thunks) for the specific issues. Adjust selectors for accurate data access. Modify API request payloads (e.g., add fields, format dates). Add small utility functions (e.g., date formatter in utils/date.ts) if essential. Insert console logs for debugging (remove before final build). Ensure TypeScript compliance and error handling (e.g., try-catch in thunks). Debugging & Implementation Approach: Step-by-Step Flow: Reproduce each issue locally (e.g., via bun run dev). Inspect: Use Redux DevTools for state, browser network tab for API calls (including CORS headers), console for errors. Fix one issue at a time: Start with auth persistence (issue 4), then user_id attachment (3), datetime (2), tags rendering (1), and finally CORS (5). Verify: Test fixes in isolation and combined (e.g., create tag → assign to task → refresh; simulate CORS in dev proxy if needed). Edge Cases: Handle empty data, network failures, invalid inputs, cross-origin mismatches—use toasts for feedback. Testing Guidelines: Manual E2E (e.g., login, create task/tag, refresh, API calls across routes); unit test thunks if existing setup allows. Run bun lint and bun test if configured. Simulate CORS errors (e.g., via browser extensions) to confirm resolution. Build Validation: Ensure bun build completes without errors; check for production optimizations (e.g., no dev-only logs, minified bundles). Expected Output & Deliverables: Functional Outcomes: Tags visible in task create modal and list (using id/name/color). Task creation succeeds without ISO datetime errors. Tags created with proper user_id association. User data persists reliably across refreshes/navigation. CORS issues resolved: All API requests succeed without cross-origin errors, preserving cookie auth. No regressions in other features (e.g., login, task list, modals). Deliverables: Provide modified code snippets/files (e.g., diffs or full updates) for affected areas (e.g., slices, components, thunks, API utils). Quality Goals: Production-safe, bug-free fixes; app remains modern, responsive, and secure. Deploy-ready (e.g., Vercel-compatible)." --json --number 5 --short-name "user-auth" "Add user authentication"`
        - PowerShell example: `.specify/scripts/bash/create-new-feature.sh --json "Role: You are a senior frontend engineer specializing in precise, production-grade debugging for Next.js applications. Your focus is on surgical fixes to resolve specific issues while preserving the existing architecture. Project Context: The frontend is an existing, mostly functional Next.js App Router app with TypeScript, Tailwind CSS, Redux Toolkit (async thunks), React Hook Form + Zod, and toast notifications. The backend (FastAPI + SQLModel + Neon DB) uses HTTP-only cookie authentication and is fully operational—treat as read-only; do not modify or access beyond API calls. Core Directive: Apply only minimal changes to fix the listed issues. Do not refactor, redesign, or alter the overall structure, UI, or state management. Maintain production safety and avoid regressions. Issues to Fix (Address ONLY These): Target each issue with isolated fixes. Verify backend behavior (e.g., via API docs or Postman) to ensure frontend alignment without assumptions. Tags Not Rendering in UI: Symptoms: Backend API endpoints return tags correctly (e.g., via GET /tags), but they do not appear in the task create modal or task list components. Root Cause Analysis: Likely mismatches in API response typing, Redux state mapping, or component rendering logic. Fixes (Minimal Changes Only): Ensure TypeScript interfaces/types for API responses match backend (e.g., tags as { id: string; name: string; color: string; }[]). Update types in relevant files (e.g., types/api.ts) if mismatched. Audit Redux tags slice: Verify async thunk fetches and stores tags properly (e.g., in extraReducers for fulfilled state). Fix selectors: Use createSelector from reselect if needed for memoized access; ensure components use useSelector to pull tags by id/name/color. In components (e.g., TaskModal.tsx, TaskList.tsx): Map tags correctly in UI (e.g., render as chips with color styles via Tailwind). Add conditional checks for empty arrays to avoid errors. No UI redesign: Just enable existing rendering logic (e.g., uncomment or fix loops like {tags.map(tag => <TagChip key={tag.id} ... />)}). Invalid Datetime/ISO Error in Task Create Modal: Symptoms: Date picker (e.g., react-datepicker or similar) is integrated, but form submission triggers backend validation errors for invalid ISO 8601 datetime format. Root Cause Analysis: Likely improper date conversion in form payload before API submission. Fixes (Minimal Changes Only): In form handling (React Hook Form onSubmit): Convert selected date to ISO 8601 string (e.g., new Date(value).toISOString()). Handle timezone offsets safely (e.g., use date-fns or native Date if already imported; add date-fns via Bun if missing, but prefer existing utils). Update Zod schema if needed: Ensure dueDate field parses as z.string().datetime({ offset: true }) for ISO compliance. Fix payload transformation: In async thunk (e.g., createTaskThunk), shape request body with corrected datetime (e.g., { ...formData, dueDate: formatISO(formData.dueDate) }). Test edge cases: Empty dates, different timezones, invalid inputs—show toast errors without locking UI. Do not alter backend rules. User ID Not Attached in Tag Creation Requests: Symptoms: Tag creation API (e.g., POST /tags) requires user_id but fails due to missing field in frontend payload. Root Cause Analysis: Frontend omits auto-attaching authenticated user's ID. Fixes (Minimal Changes Only): Pull user from Redux: Use useSelector or selector to get auth.user.id from auth slice. In async thunk (e.g., createTagThunk): Automatically add user_id to payload (e.g., { ...tagData, user_id: getState().auth.user.id }). Preserve auth: Rely on HTTP-only cookies for authentication—no token manipulation or localStorage. Test: Verify request body in dev tools network tab; ensure creation succeeds and tags associate correctly. User Data Not Persisting on Refresh/Navigation: Symptoms: User session/data sometimes lost on page refresh or route changes, leading to re-auth prompts. Root Cause Analysis: Incomplete hydration of Redux auth state on app init. Fixes (Minimal Changes Only): On app load: In root layout or _app.tsx, dispatch a thunk to call /me (or equivalent auth check endpoint) if auth state is empty (e.g., via useEffect with useDispatch). Hydrate Redux: Update auth slice to handle fulfilled state from the thunk, setting user object persistently. Use Redux middleware if needed for auto-fetch on mount. No storage changes: Stick to cookies for auth; do not introduce localStorage or Persist. Test: Refresh page, navigate routes—user data should reload seamlessly without full logout. CORS Issues with API Requests: Symptoms: API calls (e.g., fetch to backend endpoints) fail with CORS errors in console/dev tools, preventing data flow despite backend CORS being configured correctly. Root Cause Analysis: Likely missing or incorrect request options in frontend API client (e.g., no credentials: 'include' or improper mode/origin handling). Fixes (Minimal Changes Only): Centralize and update API wrapper (e.g., in utils/api.ts): Ensure all fetch/axios calls include { credentials: 'include', mode: 'cors' } to handle cookies and cross-origin requests. Verify headers: Add necessary headers if missing (e.g., Accept: 'application/json'), but only if backend requires them—check via network tab. Handle preflight: Ensure OPTIONS requests succeed by aligning with backend allowances; no backend changes. Test edge cases: Cross-domain dev setups, auth-required endpoints, large payloads—show toast errors for failures without UI lockup. Preserve cookie auth integrity. Strict Constraints: Do NOT: Change existing pages, components, or folder structure. Do NOT: Redesign UI elements, layouts, or styles. Do NOT: Refactor Redux (e.g., no new slices, middleware, or patterns). Do NOT: Introduce new libraries/state managers (e.g., no Zustand, Context API). Do NOT: Modify backend code, endpoints, or validation. Do NOT: Break working features (e.g., task CRUD, modals, themes)—test pre/post-fix. General: Keep changes minimal; prefer inline fixes over new files. Allowed Changes: Update Redux slice logic (e.g., reducers, thunks) for the specific issues. Adjust selectors for accurate data access. Modify API request payloads (e.g., add fields, format dates). Add small utility functions (e.g., date formatter in utils/date.ts) if essential. Insert console logs for debugging (remove before final build). Ensure TypeScript compliance and error handling (e.g., try-catch in thunks). Debugging & Implementation Approach: Step-by-Step Flow: Reproduce each issue locally (e.g., via bun run dev). Inspect: Use Redux DevTools for state, browser network tab for API calls (including CORS headers), console for errors. Fix one issue at a time: Start with auth persistence (issue 4), then user_id attachment (3), datetime (2), tags rendering (1), and finally CORS (5). Verify: Test fixes in isolation and combined (e.g., create tag → assign to task → refresh; simulate CORS in dev proxy if needed). Edge Cases: Handle empty data, network failures, invalid inputs, cross-origin mismatches—use toasts for feedback. Testing Guidelines: Manual E2E (e.g., login, create task/tag, refresh, API calls across routes); unit test thunks if existing setup allows. Run bun lint and bun test if configured. Simulate CORS errors (e.g., via browser extensions) to confirm resolution. Build Validation: Ensure bun build completes without errors; check for production optimizations (e.g., no dev-only logs, minified bundles). Expected Output & Deliverables: Functional Outcomes: Tags visible in task create modal and list (using id/name/color). Task creation succeeds without ISO datetime errors. Tags created with proper user_id association. User data persists reliably across refreshes/navigation. CORS issues resolved: All API requests succeed without cross-origin errors, preserving cookie auth. No regressions in other features (e.g., login, task list, modals). Deliverables: Provide modified code snippets/files (e.g., diffs or full updates) for affected areas (e.g., slices, components, thunks, API utils). Quality Goals: Production-safe, bug-free fixes; app remains modern, responsive, and secure. Deploy-ready (e.g., Vercel-compatible)." -Json -Number 5 -ShortName "user-auth" "Add user authentication"`

     **IMPORTANT**:
     - Check all three sources (remote branches, local branches, specs directories) to find the highest number
     - Only match branches/directories with the exact short-name pattern
     - If no existing branches/directories found with this short-name, start with number 1
     - You must only ever run this script once per feature
     - The JSON is provided in the terminal as output - always refer to it to get the actual content you're looking for
     - The JSON output will contain BRANCH_NAME and SPEC_FILE paths
     - For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot")

  3. Load `.specify/templates/spec-template.md` to understand required sections.

  4. Follow this execution flow:

      1. Parse user description from Input
         If empty: ERROR "No feature description provided"
      2. Extract key concepts from description
         Identify: actors, actions, data, constraints
      3. For unclear aspects:
         - Make informed guesses based on context and industry standards
         - Only mark with [NEEDS CLARIFICATION: specific question] if:
           - The choice significantly impacts feature scope or user experience
           - Multiple reasonable interpretations exist with different implications
           - No reasonable default exists
         - **LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total**
         - Prioritize clarifications by impact: scope > security/privacy > user experience > technical details
      4. Fill User Scenarios & Testing section
         If no clear user flow: ERROR "Cannot determine user scenarios"
      5. Generate Functional Requirements
         Each requirement must be testable
         Use reasonable defaults for unspecified details (document assumptions in Assumptions section)
      6. Define Success Criteria
         Create measurable, technology-agnostic outcomes
         Include both quantitative metrics (time, performance, volume) and qualitative measures (user satisfaction, task completion)
         Each criterion must be verifiable without implementation details
      7. Identify Key Entities (if data involved)
      8. Return: SUCCESS (spec ready for planning)

  5. Write the specification to SPEC_FILE using the template structure, replacing placeholders with concrete details derived from the feature description (arguments) while preserving section order and headings.

  6. **Specification Quality Validation**: After writing the initial spec, validate it against quality criteria:

     a. **Create Spec Quality Checklist**: Generate a checklist file at `FEATURE_DIR/checklists/requirements.md` using the checklist template structure with these validation items:

        ```markdown
        # Specification Quality Checklist: [FEATURE NAME]
        
        **Purpose**: Validate specification completeness and quality before proceeding to planning
        **Created**: [DATE]
        **Feature**: [Link to spec.md]
        
        ## Content Quality
        
        - [ ] No implementation details (languages, frameworks, APIs)
        - [ ] Focused on user value and business needs
        - [ ] Written for non-technical stakeholders
        - [ ] All mandatory sections completed
        
        ## Requirement Completeness
        
        - [ ] No [NEEDS CLARIFICATION] markers remain
        - [ ] Requirements are testable and unambiguous
        - [ ] Success criteria are measurable
        - [ ] Success criteria are technology-agnostic (no implementation details)
        - [ ] All acceptance scenarios are defined
        - [ ] Edge cases are identified
        - [ ] Scope is clearly bounded
        - [ ] Dependencies and assumptions identified
        
        ## Feature Readiness
        
        - [ ] All functional requirements have clear acceptance criteria
        - [ ] User scenarios cover primary flows
        - [ ] Feature meets measurable outcomes defined in Success Criteria
        - [ ] No implementation details leak into specification
        
        ## Notes
        
        - Items marked incomplete require spec updates before `/sp.clarify` or `/sp.plan`
        ```

     b. **Run Validation Check**: Review the spec against each checklist item:
        - For each item, determine if it passes or fails
        - Document specific issues found (quote relevant spec sections)

     c. **Handle Validation Results**:

        - **If all items pass**: Mark checklist complete and proceed to step 6

        - **If items fail (excluding [NEEDS CLARIFICATION])**:
          1. List the failing items and specific issues
          2. Update the spec to address each issue
          3. Re-run validation until all items pass (max 3 iterations)
          4. If still failing after 3 iterations, document remaining issues in checklist notes and warn user

        - **If [NEEDS CLARIFICATION] markers remain**:
          1. Extract all [NEEDS CLARIFICATION: ...] markers from the spec
          2. **LIMIT CHECK**: If more than 3 markers exist, keep only the 3 most critical (by scope/security/UX impact) and make informed guesses for the rest
          3. For each clarification needed (max 3), present options to user in this format:

             ```markdown
             ## Question [N]: [Topic]
             
             **Context**: [Quote relevant spec section]
             
             **What we need to know**: [Specific question from NEEDS CLARIFICATION marker]
             
             **Suggested Answers**:
             
             | Option | Answer | Implications |
             |--------|--------|--------------|
             | A      | [First suggested answer] | [What this means for the feature] |
             | B      | [Second suggested answer] | [What this means for the feature] |
             | C      | [Third suggested answer] | [What this means for the feature] |
             | Custom | Provide your own answer | [Explain how to provide custom input] |
             
             **Your choice**: _[Wait for user response]_
             ```

          4. **CRITICAL - Table Formatting**: Ensure markdown tables are properly formatted:
             - Use consistent spacing with pipes aligned
             - Each cell should have spaces around content: `| Content |` not `|Content|`
             - Header separator must have at least 3 dashes: `|--------|`
             - Test that the table renders correctly in markdown preview
          5. Number questions sequentially (Q1, Q2, Q3 - max 3 total)
          6. Present all questions together before waiting for responses
          7. Wait for user to respond with their choices for all questions (e.g., "Q1: A, Q2: Custom - [details], Q3: B")
          8. Update the spec by replacing each [NEEDS CLARIFICATION] marker with the user's selected or provided answer
          9. Re-run validation after all clarifications are resolved

     d. **Update Checklist**: After each validation iteration, update the checklist file with current pass/fail status

  7. Report completion with branch name, spec file path, checklist results, and readiness for the next phase (`/sp.clarify` or `/sp.plan`).

  **NOTE:** The script creates and checks out the new branch and initializes the spec file before writing.

  ## General Guidelines

  ## Quick Guidelines

  - Focus on **WHAT** users need and **WHY**.
  - Avoid HOW to implement (no tech stack, APIs, code structure).
  - Written for business stakeholders, not developers.
  - DO NOT create any checklists that are embedded in the spec. That will be a separate command.

  ### Section Requirements

  - **Mandatory sections**: Must be completed for every feature
  - **Optional sections**: Include only when relevant to the feature
  - When a section doesn't apply, remove it entirely (don't leave as "N/A")

  ### For AI Generation

  When creating this spec from a user prompt:

  1. **Make informed guesses**: Use context, industry standards, and common patterns to fill gaps
  2. **Document assumptions**: Record reasonable defaults in the Assumptions section
  3. **Limit clarifications**: Maximum 3 [NEEDS CLARIFICATION] markers - use only for critical decisions that:
     - Significantly impact feature scope or user experience
     - Have multiple reasonable interpretations with different implications
     - Lack any reasonable default
  4. **Prioritize clarifications**: scope > security/privacy > user experience > technical details
  5. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
  6. **Common areas needing clarification** (only if no reasonable default exists):
     - Feature scope and boundaries (include/exclude specific use cases)
     - User types and permissions (if multiple conflicting interpretations possible)
     - Security/compliance requirements (when legally/financially significant)
     - Integration patterns: RESTful APIs unless specified otherwise

  **Examples of reasonable defaults** (don't ask about these):

  - Data retention: Industry-standard practices for the domain
  - Performance targets: Standard web/mobile app expectations unless specified
  - Error handling: User-friendly messages with appropriate fallbacks
  - Authentication method: Standard session-based or OAuth2 for web apps

  ### Success Criteria Guidelines

  Success criteria must be:

  1. **Measurable**: Include specific metrics (time, percentage, count, rate)
  2. **Technology-agnostic**: No mention of frameworks, languages, databases, or tools
  3. **User-focused**: Describe outcomes from user/business perspective, not system internals
  4. **Verifiable**: Can be tested/validated without knowing implementation details

  **Good examples**:

  - "Users can complete checkout in under 3 minutes"
  - "System supports 10,000 concurrent users"
  - "95% of searches return results in under 1 second"
  - "Task completion rate improves by 40%"

  **Bad examples** (implementation-focused):

  - "API response time is under 200ms" (too technical, use "Users see results instantly")
  - "Database can handle 1000 TPS" (implementation detail, use user-facing metric)
  - "React components render efficiently" (framework-specific)
  - "Redis cache hit rate above 80%" (technology-specific)

response_text: |
  I have successfully created the feature specification for the frontend debugging fixes. Here's what I've accomplished:

  1. **Created a new feature branch**: `004-frontend-debug-fixes`
  2. **Generated a comprehensive specification** that addresses all the frontend issues:
     - Tags not rendering in UI
     - Invalid datetime/ISO errors in task creation
     - Missing user ID in tag creation requests
     - User data not persisting on refresh/navigation
     - CORS issues with API requests

  3. **Validated the specification** against quality criteria and confirmed:
     - All requirements are testable and unambiguous
     - Success criteria are measurable and technology-agnostic
     - All acceptance scenarios are defined
     - Edge cases are identified
     - No implementation details leak into the specification

  The specification is now ready for the next phase, whether that's clarification (`/sp.clarify`) or planning (`/sp.plan`). The spec focuses on the user value and business needs while maintaining the constraints of minimal changes and preserving existing architecture.