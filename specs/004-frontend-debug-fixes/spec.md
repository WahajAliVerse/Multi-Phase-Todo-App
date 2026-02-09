# Feature Specification: Frontend Debug Fixes

**Feature Branch**: `004-frontend-debug-fixes`
**Created**: 2026-02-09
**Status**: Draft
**Input**: User description: "Role: You are a senior frontend engineer specializing in precise, production-grade debugging for Next.js applications. Your focus is on surgical fixes to resolve specific issues while preserving the existing architecture. Project Context: The frontend is an existing, mostly functional Next.js App Router app with TypeScript, Tailwind CSS, Redux Toolkit (async thunks), React Hook Form + Zod, and toast notifications. The backend (FastAPI + SQLModel + Neon DB) uses HTTP-only cookie authentication and is fully operational—treat as read-only; do not modify or access beyond API calls. Core Directive: Apply only minimal changes to fix the listed issues. Do not refactor, redesign, or alter the overall structure, UI, or state management. Maintain production safety and avoid regressions. Issues to Fix (Address ONLY These): Target each issue with isolated fixes. Verify backend behavior (e.g., via API docs or Postman) to ensure frontend alignment without assumptions. Tags Not Rendering in UI: Symptoms: Backend API endpoints return tags correctly (e.g., via GET /tags), but they do not appear in the task create modal or task list components. Root Cause Analysis: Likely mismatches in API response typing, Redux state mapping, or component rendering logic. Fixes (Minimal Changes Only): Ensure TypeScript interfaces/types for API responses match backend (e.g., tags as { id: string; name: string; color: string; }[]). Update types in relevant files (e.g., types/api.ts) if mismatched. Audit Redux tags slice: Verify async thunk fetches and stores tags properly (e.g., in extraReducers for fulfilled state). Fix selectors: Use createSelector from reselect if needed for memoized access; ensure components use useSelector to pull tags by id/name/color. In components (e.g., TaskModal.tsx, TaskList.tsx): Map tags correctly in UI (e.g., render as chips with color styles via Tailwind). Add conditional checks for empty arrays to avoid errors. No UI redesign: Just enable existing rendering logic (e.g., uncomment or fix loops like {tags.map(tag => <TagChip key={tag.id} ... />)}). Invalid Datetime/ISO Error in Task Create Modal: Symptoms: Date picker (e.g., react-datepicker or similar) is integrated, but form submission triggers backend validation errors for invalid ISO 8601 datetime format. Root Cause Analysis: Likely improper date conversion in form payload before API submission. Fixes (Minimal Changes Only): In form handling (React Hook Form onSubmit): Convert selected date to ISO 8601 string (e.g., new Date(value).toISOString()). Handle timezone offsets safely (e.g., use date-fns or native Date if already imported; add date-fns via Bun if missing, but prefer existing utils). Update Zod schema if needed: Ensure dueDate field parses as z.string().datetime({ offset: true }) for ISO compliance. Fix payload transformation: In async thunk (e.g., createTaskThunk), shape request body with corrected datetime (e.g., { ...formData, dueDate: formatISO(formData.dueDate) }). Test edge cases: Empty dates, different timezones, invalid inputs—show toast errors without locking UI. Do not alter backend rules. User ID Not Attached in Tag Creation Requests: Symptoms: Tag creation API (e.g., POST /tags) requires user_id but fails due to missing field in frontend payload. Root Cause Analysis: Frontend omits auto-attaching authenticated user's ID. Fixes (Minimal Changes Only): Pull user from Redux: Use useSelector or selector to get auth.user.id from auth slice. In async thunk (e.g., createTagThunk): Automatically add user_id to payload (e.g., { ...tagData, user_id: getState().auth.user.id }). Preserve auth: Rely on HTTP-only cookies for authentication—no token manipulation or localStorage. Test: Verify request body in dev tools network tab; ensure creation succeeds and tags associate correctly. User Data Not Persisting on Refresh/Navigation: Symptoms: User session/data sometimes lost on page refresh or route changes, leading to re-auth prompts. Root Cause Analysis: Incomplete hydration of Redux auth state on app init. Fixes (Minimal Changes Only): On app load: In root layout or _app.tsx, dispatch a thunk to call /me (or equivalent auth check endpoint) if auth state is empty (e.g., via useEffect with useDispatch). Hydrate Redux: Update auth slice to handle fulfilled state from the thunk, setting user object persistently. Use Redux middleware if needed for auto-fetch on mount. No storage changes: Stick to cookies for auth; do not introduce localStorage or Persist. Test: Refresh page, navigate routes—user data should reload seamlessly without full logout. CORS Issues with API Requests: Symptoms: API calls (e.g., fetch to backend endpoints) fail with CORS errors in console/dev tools, preventing data flow despite backend CORS being configured correctly. Root Cause Analysis: Likely missing or incorrect request options in frontend API client (e.g., no credentials: 'include' or improper mode/origin handling). Fixes (Minimal Changes Only): Centralize and update API wrapper (e.g., in utils/api.ts): Ensure all fetch/axios calls include { credentials: 'include', mode: 'cors' } to handle cookies and cross-origin requests. Verify headers: Add necessary headers if missing (e.g., Accept: 'application/json'), but only if backend requires them—check via network tab. Handle preflight: Ensure OPTIONS requests succeed by aligning with backend allowances; no backend changes. Test edge cases: Cross-domain dev setups, auth-required endpoints, large payloads—show toast errors for failures without UI lockup. Preserve cookie auth integrity. Strict Constraints: Do NOT: Change existing pages, components, or folder structure. Do NOT: Redesign UI elements, layouts, or styles. Do NOT: Refactor Redux (e.g., no new slices, middleware, or patterns). Do NOT: Introduce new libraries/state managers (e.g., no Zustand, Context API). Do NOT: Modify backend code, endpoints, or validation. Do NOT: Break working features (e.g., task CRUD, modals, themes)—test pre/post-fix. General: Keep changes minimal; prefer inline fixes over new files. Allowed Changes: Update Redux slice logic (e.g., reducers, thunks) for the specific issues. Adjust selectors for accurate data access. Modify API request payloads (e.g., add fields, format dates). Add small utility functions (e.g., date formatter in utils/date.ts) if essential. Insert console logs for debugging (remove before final build). Ensure TypeScript compliance and error handling (e.g., try-catch in thunks). Debugging & Implementation Approach: Step-by-Step Flow: Reproduce each issue locally (e.g., via bun run dev). Inspect: Use Redux DevTools for state, browser network tab for API calls (including CORS headers), console for errors. Fix one issue at a time: Start with auth persistence (issue 4), then user_id attachment (3), datetime (2), tags rendering (1), and finally CORS (5). Verify: Test fixes in isolation and combined (e.g., create tag → assign to task → refresh; simulate CORS in dev proxy if needed). Edge Cases: Handle empty data, network failures, invalid inputs, cross-origin mismatches—use toasts for feedback. Testing Guidelines: Manual E2E (e.g., login, create task/tag, refresh, API calls across routes); unit test thunks if existing setup allows. Run bun lint and bun test if configured. Simulate CORS errors (e.g., via browser extensions) to confirm resolution. Build Validation: Ensure bun build completes without errors; check for production optimizations (e.g., no dev-only logs, minified bundles). Expected Output & Deliverables: Functional Outcomes: Tags visible in task create modal and list (using id/name/color). Task creation succeeds without ISO datetime errors. Tags created with proper user_id association. User data persists reliably across refreshes/navigation. CORS issues resolved: All API requests succeed without cross-origin errors, preserving cookie auth. No regressions in other features (e.g., login, task list, modals). Deliverables: Provide modified code snippets/files (e.g., diffs or full updates) for affected areas (e.g., slices, components, thunks, API utils). Quality Goals: Production-safe, bug-free fixes; app remains modern, responsive, and secure. Deploy-ready (e.g., Vercel-compatible)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Tags in Task Components (Priority: P1)

As a user managing tasks, I need to see tags associated with my tasks displayed visually with their colors so that I can quickly categorize and identify related tasks.

**Why this priority**: This is a core feature that users rely on for organizing their tasks effectively. Without visible tags, the categorization system becomes useless.

**Independent Test**: Can be fully tested by creating tasks with tags and verifying they appear in the task list and modal with proper styling and colors.

**Acceptance Scenarios**:

1. **Given** a user has created tasks with tags, **When** viewing the task list, **Then** tags appear as colored chips with their names and colors
2. **Given** a user opens the task creation/edit modal, **When** tags are available, **Then** tags appear as selectable colored chips
3. **Given** a user is creating a task, **When** viewing the tag selection dropdown, **Then** all existing tags from the API are available for selection
4. **Given** a user navigates to the tags page, **When** the page loads, **Then** all tags from the API are displayed on the page

---

### User Story 2 - Create Tasks with Valid Dates (Priority: P1)

As a user scheduling tasks, I need to be able to create tasks with due dates without encountering validation errors so that I can properly organize my schedule.

**Why this priority**: Date functionality is essential for task management. If users can't set due dates, the application loses a critical feature.

**Independent Test**: Can be fully tested by creating tasks with various date formats and verifying they save successfully without backend validation errors.

**Acceptance Scenarios**:

1. **Given** a user selects a date in the task creation form, **When** submitting the task, **Then** the task saves successfully without ISO format errors
2. **Given** a user enters an invalid date, **When** submitting the task, **Then** a clear error message appears without crashing the UI

---

### User Story 3 - Create Tags Associated with User Account (Priority: P1)

As a user creating tags, I need to be able to create tags that are properly associated with my account so that they persist and are accessible only to me.

**Why this priority**: Without proper user association, tags either fail to save or become shared across all users, breaking data isolation.

**Independent Test**: Can be fully tested by creating tags and verifying they are saved with the correct user ID and appear in the user's tag list.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** creating a new tag, **Then** the tag is saved with the user's ID attached
2. **Given** a user creates multiple tags, **When** viewing their tag list, **Then** all tags appear and are owned by the correct user

---

### User Story 4 - Maintain Session Across Page Refreshes (Priority: P1)

As a user working with the application, I need my authentication session to persist when I refresh the page so that I don't have to log in repeatedly.

**Why this priority**: Session loss creates a poor user experience and makes the application feel unreliable. Users expect to stay logged in.

**Independent Test**: Can be fully tested by logging in, refreshing the page, and verifying the user remains authenticated with their data intact.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** refreshing the page, **Then** the user remains authenticated and sees their data
2. **Given** a user navigates between application routes, **When** returning to previous pages, **Then** their authentication state remains consistent

---

### User Story 5 - Access Backend API Without CORS Errors (Priority: P1)

As a user interacting with the application, I need all API requests to succeed without CORS errors so that all features work properly.

**Why this priority**: CORS errors block all API communication, making the application unusable. This is a foundational requirement.

**Independent Test**: Can be fully tested by performing various API operations and verifying no CORS errors appear in the console.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** making API requests, **Then** all requests succeed without CORS errors
2. **Given** the application makes authenticated requests, **When** communicating with the backend, **Then** cookies are properly sent with requests

---

### Edge Cases

- What happens when tags API returns an empty list?
- How does the system handle invalid date formats during task creation?
- What occurs when the user's authentication expires during a session?
- How does the system behave when API requests fail temporarily?
- What happens when creating tags with duplicate names?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display tags with their correct colors and names in task components using TagChip elements
- **FR-002**: System MUST convert date inputs to proper ISO 8601 format before sending to the backend API
- **FR-003**: System MUST automatically attach the authenticated user's ID when creating new tags
- **FR-004**: System MUST maintain user authentication state across page refreshes and navigation
- **FR-005**: System MUST handle all API requests without CORS errors while preserving cookie authentication
- **FR-006**: System MUST preserve existing UI design and architecture during fixes
- **FR-007**: System MUST maintain all existing functionality without introducing regressions
- **FR-008**: System MUST handle edge cases gracefully with appropriate error messaging
- **FR-009**: System MUST provide a dropdown in the task creation form to select existing tags from the API
- **FR-010**: System MUST display all tags from the API on the tags page when the user navigates to it

### Key Entities

- **Tag**: Represents a category or label that can be applied to tasks, containing id, name, color, and user association
- **Task**: Represents a user's to-do item that can have due dates and be associated with multiple tags
- **User**: Represents an authenticated user account with associated data and permissions
- **Authentication Session**: Represents the user's logged-in state maintained via HTTP-only cookies

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tags appear visually in task components with correct colors and names 100% of the time after fixes
- **SC-002**: Task creation with due dates succeeds 100% of the time without ISO format validation errors
- **SC-003**: Tag creation associates correctly with the authenticated user 100% of the time
- **SC-004**: User authentication persists across page refreshes 100% of the time
- **SC-005**: Zero CORS errors occur during normal application usage
- **SC-006**: No existing functionality regresses after implementing fixes
- **SC-007**: Application builds successfully without errors after changes
- **SC-008**: All API requests maintain cookie authentication properly
- **SC-009**: Tag selection dropdown in task creation form displays all available tags from the API 100% of the time
- **SC-010**: Tags page displays all tags from the API 100% of the time when accessed