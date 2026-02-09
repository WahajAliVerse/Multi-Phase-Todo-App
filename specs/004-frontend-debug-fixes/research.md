# Research Summary: Frontend Debug Fixes

## Decision: Tags Not Rendering in UI
**Rationale**: Backend API returns tags correctly but they don't appear in task components due to mismatch in API response typing, Redux state mapping, or component rendering logic. Solution involves ensuring TypeScript interfaces match backend, verifying Redux thunks properly fetch and store tags, and updating components to render tags using TagChip elements with proper colors.

**Alternatives considered**: 
- Complete UI redesign (rejected - violates constraint of preserving existing architecture)
- Separate tag service (rejected - unnecessary complexity for simple rendering issue)

## Decision: Invalid Datetime/ISO Error in Task Create Modal
**Rationale**: Date conversion in form payload before API submission is improper. Solution involves converting selected date to ISO 8601 string using new Date(value).toISOString() and handling timezone offsets safely.

**Alternatives considered**:
- Using external date library like date-fns (rejected - prefer existing utils as per constraints)
- Changing backend validation (rejected - backend rules should not be altered)

## Decision: User ID Not Attached in Tag Creation Requests
**Rationale**: Frontend omits auto-attaching authenticated user's ID when creating tags. Solution involves pulling user from Redux state and automatically adding user_id to payload in createTagThunk.

**Alternatives considered**:
- Manual user ID entry (rejected - poor UX, defeats purpose of authentication)
- Session storage for user ID (rejected - violates cookie-only auth approach)

## Decision: User Data Not Persisting on Refresh/Navigation
**Rationale**: Incomplete hydration of Redux auth state on app init causes session loss. Solution involves dispatching a thunk to call /me endpoint on app load if auth state is empty, hydrating Redux with user object.

**Alternatives considered**:
- LocalStorage for session persistence (rejected - violates constraint of sticking to cookies)
- Alternative auth mechanisms (rejected - preserves existing cookie-based approach)

## Decision: CORS Issues with API Requests
**Rationale**: Missing or incorrect request options in frontend API client cause CORS errors. Solution involves ensuring all fetch calls include { credentials: 'include', mode: 'cors' } to handle cookies and cross-origin requests properly.

**Alternatives considered**:
- Disabling CORS (rejected - security risk)
- Backend-only solution (rejected - requires changes to backend, which is read-only per constraints)