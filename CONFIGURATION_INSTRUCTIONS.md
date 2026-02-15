# Configuration Instructions for CORS and Cookie Issues

## Problem
- Backend is deployed (HTTPS)
- Frontend is running locally on http://localhost:3000
- Authentication uses HTTP-only cookies
- After login, protected APIs (e.g. /tasks, /auth/me) return CORS errors
- Cookies are not being sent in protected requests

## Solution Applied

### Backend Changes
1. Updated CORS middleware in `backend/todo-backend/app.py`:
   - Replaced `allow_origins=["*"]` with specific origins
   - Added `expose_headers=["Access-Control-Allow-Origin", "Set-Cookie"]`
   - Added `"http://localhost:3000"` to allowed origins

2. Updated cookie security settings in `backend/todo-backend/src/core/security.py`:
   - Modified `create_session_cookie` function to conditionally set `secure` flag based on environment
   - Changed `samesite` policy from "strict" to "lax" to allow cross-origin requests with credentials

### Frontend Changes
1. Updated `frontend/utils/api.ts`:
   - Updated BASE_URL to point to deployed backend
   - Added conditional credential handling for development environment

## Required Configuration

### For Local Development with Deployed Backend
Update your frontend `.env.local` file with the deployed backend URL:

```
NEXT_PUBLIC_API_BASE_URL=https://your-actual-deployed-backend-url.com/api
```

Replace `https://your-actual-deployed-backend-url.com/api` with your actual deployed backend URL.

### Environment Variables
Set the environment variable in your backend deployment:

```
ENVIRONMENT=production  # or remove this variable to default to secure cookies
```

For local development with mixed HTTP/HTTPS setup, you can temporarily set:
```
ENVIRONMENT=development
```

## Summary of Changes Made

1. **Backend CORS Configuration** (`backend/todo-backend/app.py`):
   - Specific origins instead of wildcard
   - Exposed "Set-Cookie" header

2. **Cookie Security Settings** (`backend/todo-backend/src/core/security.py`):
   - Conditional secure flag based on environment
   - Lax same-site policy for cross-origin requests

3. **Frontend API Configuration** (`frontend/utils/api.ts`):
   - Updated base URL to point to deployed backend
   - Enhanced credential handling for development

These changes should resolve the CORS errors and ensure cookies are properly sent with requests from your local frontend to your deployed backend.