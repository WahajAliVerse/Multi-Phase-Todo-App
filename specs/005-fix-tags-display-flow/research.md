# Research: Fix Tags Display Flow

## Decision: DTO Implementation Approach
**Rationale**: To resolve the data mismatch between backend snake_case and frontend camelCase field names, we need to implement DTOs (Data Transfer Objects) with a clear transformation layer. This approach provides clean separation between backend and frontend data structures, making the codebase more maintainable and less prone to errors when backend field names change.

**Alternatives considered**:
1. Direct field mapping without DTOs - Would lead to tight coupling between backend and frontend structures
2. Backend changes to return camelCase - Would break existing API contracts and affect other consumers
3. Inline transformations in components - Would scatter transformation logic throughout the codebase

## Decision: Redux State Management Update
**Rationale**: The current Redux state management for tags is not properly handling transformed data, leading to display issues. Updating the Redux slice to work with properly transformed data ensures consistency between the backend and frontend state.

**Alternatives considered**:
1. Keep current approach with ad-hoc fixes - Would not address the root cause
2. Switch to a different state management solution - Would be overkill and break existing functionality
3. Store raw backend data in Redux - Would require transformation in every component

## Decision: API Utility Function Updates
**Rationale**: The API utility functions need to be updated to properly handle DTO transformations and ensure user_id is correctly included in tag creation requests. This centralizes the transformation logic and ensures consistency across all API calls.

**Alternatives considered**:
1. Handle transformations in individual components - Would scatter logic and create inconsistency
2. Modify backend API to accept camelCase - Would break existing contracts
3. Keep current API functions with workarounds - Would not address the root cause

## Decision: User Authentication Handling
**Rationale**: Ensuring proper user_id inclusion in tag creation requires verifying that the authenticated user's ID is available and correctly passed to the backend. This maintains security and ensures proper data ownership.

**Alternatives considered**:
1. Allow anonymous tag creation - Would violate security requirements
2. Hardcode user_id in API calls - Would be insecure and inflexible
3. Skip user_id validation - Would lead to data integrity issues