# Authentication System Setup Guide

This document explains the authentication system implemented in the multi-phase-todo application, including both frontend and backend components.

## Overview

The application implements a secure authentication system using:
- HTTP-only cookies for storing JWT tokens
- Access tokens (expire in 30 minutes)
- Refresh tokens (expire in 7 days)
- Automatic token refresh mechanism
- Proper CORS configuration for development and production

## Frontend Implementation

### Key Components

1. **API Service (`frontend/src/services/api.ts`)**:
   - Implements axios interceptors for automatic token refresh
   - Handles 401 errors by attempting token refresh
   - Prevents multiple simultaneous refresh requests
   - Queues requests during refresh process

2. **Authentication Service (`frontend/src/services/authService.ts`)**:
   - Handles login, registration, logout
   - Manages token refresh requests
   - Provides user information retrieval

3. **Auth Hook (`frontend/src/hooks/useAuth.tsx`)**:
   - Manages authentication state
   - Handles initial user verification
   - Coordinates token refresh logic

### Token Refresh Flow

1. When a 401 error occurs, the interceptor checks if it's a retry attempt
2. If not retrying and not a refresh/logout/login endpoint, attempts refresh
3. If refresh is already in progress, queues the request
4. After successful refresh, retries the original request
5. If refresh fails, logs out the user

## Backend Implementation

### Key Components

1. **JWT Functions (`backend/src/core/security.py`)**:
   - Creates access and refresh tokens
   - Verifies token validity
   - Uses user IDs in tokens for security

2. **Auth Routes (`backend/src/api/api_v1/routes/auth.py`)**:
   - Login: sets HTTP-only cookies with tokens
   - Refresh: validates refresh token and issues new access token
   - Logout: clears authentication cookies
   - Me: verifies access token and returns user info

3. **Middleware (`backend/src/middleware/auth_middleware.py`)**:
   - Extracts tokens from cookies
   - Verifies token validity
   - Retrieves user information

### Security Features

- Tokens stored in HTTP-only cookies (prevents XSS attacks)
- Secure flag set based on environment (HTTPS in production)
- SameSite=lax to prevent CSRF attacks
- User IDs used in tokens instead of usernames
- Proper token type validation

## Environment Configuration

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/v1
NEXT_PUBLIC_APP_NAME=Todo App
NEXT_PUBLIC_DEFAULT_THEME=system
```

### Backend (.env)
```
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_URL=sqlite:///./todo_app.db
ENVIRONMENT=development  # Set to "production" for HTTPS cookies
```

## Common Issues and Solutions

### 1. Unauthorized Errors Despite Valid Authentication

**Cause**: Multiple possible causes:
- Token expiration
- Cookie not being sent with requests
- CORS misconfiguration
- Race conditions during refresh

**Solution**: 
- Ensure `withCredentials: true` is set in axios config
- Check CORS configuration allows credentials
- Verify cookie security settings match environment

### 2. Unnecessary Refresh API Calls

**Cause**: Interceptor logic triggering refresh for non-protected endpoints

**Solution**: Updated interceptor to skip refresh for auth endpoints:
```typescript
const skipRefreshEndpoints = ['/auth/login', '/auth/refresh', '/auth/logout'];
```

### 3. Cookie Security in Development vs Production

**Development**: `secure=false`, `sameSite=lax`
**Production**: `secure=true`, `sameSite=strict`

Environment variable `ENVIRONMENT` controls this behavior.

## Best Practices Implemented

1. **Secure Token Storage**: HTTP-only cookies prevent XSS attacks
2. **Automatic Refresh**: Seamless user experience without interruption
3. **Race Condition Prevention**: Queue system prevents multiple refresh requests
4. **Proper Error Handling**: Graceful degradation when refresh fails
5. **Environment-Specific Security**: Different settings for dev/prod
6. **Consistent User Identification**: Using user IDs instead of usernames in tokens

## Testing the Authentication System

To test the authentication system:

1. Start both frontend and backend servers
2. Register a new user account
3. Log in and verify cookies are set
4. Perform actions that require authentication
5. Wait for token to expire and verify automatic refresh
6. Test logout functionality

## Troubleshooting

### Debugging Steps

1. Check browser network tab for cookie headers
2. Verify CORS headers are present
3. Confirm token expiration times
4. Check server logs for authentication errors
5. Verify environment variables are set correctly

### Common Debug Commands

Frontend:
```bash
npm run dev
# Check browser console for errors
```

Backend:
```bash
uvicorn main:app --reload
# Check server logs for authentication flow
```

## Security Considerations

- Always use HTTPS in production (secure cookies)
- Regularly rotate secret keys
- Monitor for suspicious authentication attempts
- Implement rate limiting for auth endpoints
- Consider additional security measures like 2FA for sensitive applications