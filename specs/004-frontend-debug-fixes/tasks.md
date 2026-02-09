# Implementation Tasks: Frontend Debug Fixes

**Feature**: Frontend Debug Fixes
**Branch**: 004-frontend-debug-fixes
**Created**: 2026-02-09
**Input**: Implementation plan from `/specs/004-frontend-debug-fixes/plan.md`

## Task Organization

### Dependency Graph
```
Setup → Foundational → US4 (Auth Persistence) → US3 (User ID in Tags) → US2 (Date Conversion) → US1 (Tag Rendering) → US5 (CORS) → Polish
```

### Parallel Execution Opportunities
- [US2], [US3], [US4], [US5] can be worked on in parallel after foundational tasks are complete
- Individual component fixes within [US1] can be done in parallel

## Phase 1: Setup
*Initialize project structure and verify environment*

- [x] T001 Set up development environment with proper dependencies
- [x] T002 Verify backend API connectivity and authentication
- [x] T003 Confirm existing functionality works before making changes

## Phase 2: Foundational
*Core infrastructure fixes that unblock all user stories*

- [x] T010 [P] Update API utility to ensure proper CORS and credential handling in `frontend/utils/api.ts`
- [x] T011 [P] Verify TypeScript interfaces match backend API response format in `frontend/types/api.ts`
- [x] T012 [P] Ensure Redux store configuration supports required changes in `frontend/redux/store.ts`

## Phase 3: [US4] Maintain Session Across Page Refreshes
*User data persists on refresh/navigation*

**Goal**: Ensure user authentication state persists across page refreshes and navigation

**Independent Test**: User can refresh the page and remain authenticated with their data intact

- [x] T020 Implement auth initializer to check authentication status on app load in `frontend/components/providers/AuthInitializer.tsx`
- [x] T021 Update auth slice to properly handle fulfilled state from auth check thunk in `frontend/redux/slices/authSlice.ts`
- [x] T022 Test page refresh maintains user session and data

## Phase 4: [US3] Create Tags Associated with User Account
*User ID automatically attached when creating tags*

**Goal**: Ensure tags are properly associated with the authenticated user when created

**Independent Test**: Creating a tag results in it being saved with the correct user ID and appearing in the user's tag list

- [x] T030 Update createTag thunk to automatically include user ID from auth state in `frontend/redux/slices/tagsSlice.ts`
- [x] T031 Verify tag creation API request includes user_id field
- [x] T032 Test that created tags are properly associated with the authenticated user

## Phase 5: [US2] Create Tasks with Valid Dates
*Date conversion fixed for task creation*

**Goal**: Ensure date inputs are properly converted to ISO 8601 format before API submission

**Independent Test**: Creating tasks with due dates succeeds without ISO format validation errors

- [x] T040 Update TaskForm to properly convert date inputs to ISO format in `frontend/components/forms/TaskForm.tsx`
- [x] T041 Handle timezone offsets safely when converting dates
- [x] T042 Test task creation with various date formats and edge cases
- [x] T043 Add error handling for invalid date inputs

## Phase 6: [US1] View Tags in Task Components
*Tags render properly in UI with colors*

**Goal**: Display tags with correct colors and names in task components using TagChip elements

**Independent Test**: Creating tasks with tags results in tags appearing in the task list and modal with proper styling and colors

- [x] T050 Update TaskCard component to render tags using TagChip elements in `frontend/components/common/TaskCard.tsx`
- [x] T051 Ensure tags are fetched and mapped correctly from Redux state
- [x] T052 Verify tag colors and names display correctly in UI
- [x] T053 Add conditional checks for empty tag arrays to avoid errors
- [x] T054 Test tag rendering in task creation/edit modal
- [x] T055 Update TaskForm to include dropdown for selecting existing tags in `frontend/components/forms/TaskForm.tsx`
- [x] T056 Update tags page to fetch and display all tags from API for selection in the dropdown component
- [x] T057 Implement tag selection functionality to set tag IDs when creating tasks
- [x] T058 Verify selected tags are sent to task API with proper tag IDs
- [x] T059 Create/update tags page to display all tags from the API in a grid/list format in `frontend/app/tags/page.tsx`
- [x] T060 Ensure tags page fetches all tags from the API when loaded
- [x] T061 Implement proper tag display with colors and names on the tags page
- [x] T062 Add functionality to edit/delete tags directly from the tags page
- [x] T063 Implement tags page component to render TagChips with proper styling
- [x] T064 Add search/filter functionality to the tags page to find specific tags
- [x] T065 Implement pagination for the tags page when there are many tags
- [x] T066 Add sorting functionality to the tags page (by name, color, creation date)

## Phase 7: [US5] Access Backend API Without CORS Errors
*CORS issues resolved for all API requests*

**Goal**: Ensure all API requests succeed without CORS errors while preserving cookie authentication

**Independent Test**: Performing various API operations results in no CORS errors in the console

- [x] T063 Verify all API calls in utils/api.ts include proper credentials and CORS settings
- [x] T064 Test API requests with authentication cookies
- [x] T065 Confirm no CORS errors appear in browser console

## Phase 8: Polish & Cross-Cutting Concerns
*Final integration, testing, and quality assurance*

- [x] T070 Perform end-to-end testing of all fixed features
- [x] T071 Verify no regressions in existing functionality
- [x] T072 Run build process to ensure no errors
- [x] T073 Clean up any debug code or temporary fixes
- [x] T074 Update documentation if needed
- [x] T075 Final verification of all acceptance criteria

## Dependencies

### User Story Completion Order
1. US4 (Auth Persistence) must be completed before US1, US2, US3
2. US3 (User ID in Tags) must be completed before US1 (Tag Rendering) can be fully tested
3. US2 (Date Conversion) can be done in parallel with other stories
4. US1 (Tag Rendering) depends on foundational and US3 being complete
5. US5 (CORS) can be done in parallel but should be verified after other changes

### Parallel Execution Examples
- T030-T032 (US3) can run in parallel with T040-T043 (US2) and T060-T062 (US5)
- T020-T022 (US4) should complete before other user stories are fully validated
- Individual tag rendering components in US1 can be updated in parallel

## Implementation Strategy

### MVP Scope
The minimum viable product includes:
- US4: Auth persistence so users stay logged in after refresh
- US3: Tags properly associated with users when created
- US1: Tags display with colors in task components

### Incremental Delivery
1. First deliver authentication persistence (US4) to ensure stable foundation
2. Then deliver tag creation with user association (US3)
3. Follow with tag rendering in UI (US1)
4. Complete with date conversion (US2) and CORS fixes (US5)
5. Finish with polish and verification phase