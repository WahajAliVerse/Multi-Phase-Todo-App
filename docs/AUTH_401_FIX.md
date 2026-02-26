# Authentication 401 Error Fix - Production Cookie Configuration

## Problem Summary

**Issue**: Login works in local development but returns 401 authentication errors in production because cookies are not being sent with API requests.

## Root Cause

The authentication failure was caused by multiple configuration issues:

1. **Cookie Configuration**: The `create_session_cookie` function didn't properly configure cookies for cross-origin requests
2. **CORS Configuration**: CORS middleware wasn't exposing all necessary headers for cookie handling
3. **Missing Environment Files**: No `.env` files existed to configure production settings

## Files Modified

### 1. Backend: `backend/todo-backend/src/core/security.py`

**Changes**:
- Added proper `path="/"` attribute to ensure cookies are sent to all API endpoints
- Added optional `COOKIE_DOMAIN` environment variable support for production
- Improved environment detection logic
- Added comprehensive documentation

**Before**:
```python
def create_session_cookie(response, token: str):
    is_secure = os.getenv("ENVIRONMENT") != "development"
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        max_age=1800
    )
```

**After**:
```python
def create_session_cookie(response: Response, token: str):
    is_production = os.getenv("ENVIRONMENT") == "production"
    secure = is_production  # True only in production (HTTPS)
    cookie_domain = os.getenv("COOKIE_DOMAIN", None)
    
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=1800,
        domain=cookie_domain,
        path="/"  # Cookie available for all API endpoints
    )
```

### 2. Backend: `backend/todo-backend/app.py`

**Changes**:
- Added environment variable support for `CORS_ORIGINS`
- Added default localhost variants for development
- Improved CORS header exposure
- Added `max_age` for preflight caching

**Before**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://multi-phase-todo-app.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Access-Control-Allow-Origin", "Set-Cookie"]
)
```

**After**:
```python
cors_origins_str = os.getenv("CORS_ORIGINS", "")
cors_origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

all_origins = list(set(default_origins + cors_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=all_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=[
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Credentials",
        "Set-Cookie"
    ],
    max_age=600
)
```

### 3. Backend: `backend/todo-backend/.env` (Created)

New file with production-ready configuration:
- `ENVIRONMENT` - Set to `development` or `production`
- `SECRET_KEY` - Critical for JWT token security
- `CORS_ORIGINS` - Comma-separated list of allowed frontend URLs
- `COOKIE_DOMAIN` - Optional, for production cookie domain

### 4. Frontend: `frontend/.env.local` (Created)

New file with API configuration:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL for local and production

## Configuration Guide

### Local Development

**Backend `.env`**:
```bash
ENVIRONMENT=development
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Frontend `.env.local`**:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8003/api
```

### Production Deployment

**Backend `.env`**:
```bash
ENVIRONMENT=production
SECRET_KEY=<generate-strong-random-key>
CORS_ORIGINS=https://your-frontend.vercel.app
# Optional: COOKIE_DOMAIN=.your-domain.com
```

**Frontend `.env.local`** (or Vercel Environment Variables):
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
```

## How Cookie Authentication Works

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │      │    CORS     │      │   Backend   │
│  (Next.js)  │      │   Preflight │      │  (FastAPI)  │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                    │
       │  POST /auth/login  │                    │
       │  credentials:include│                    │
       │───────────────────>│                    │
       │                    │                    │
       │                    │  OPTIONS (preflight)│
       │                    │───────────────────>│
       │                    │                    │
       │                    │  Access-Control-Allow-Credentials: true
       │                    │  Access-Control-Allow-Origin: https://frontend
       │                    │  Access-Control-Allow-Headers: Content-Type
       │                    │<───────────────────│
       │                    │                    │
       │                    │  POST /auth/login  │
       │                    │───────────────────>│
       │                    │                    │
       │                    │  Set-Cookie: access_token=xxx;
       │                    │  Secure; SameSite=lax; Path=/
       │                    │<───────────────────│
       │  Set-Cookie header│                    │
       │<───────────────────│                    │
       │                    │                    │
       │  GET /api/tasks    │                    │
       │  Cookie: access_token=xxx
       │───────────────────>│                    │
       │                    │                    │
       │  200 OK (tasks)   │                    │
       │<───────────────────│                    │
       │                    │                    │
```

## Key Configuration Points

### 1. `credentials: 'include'` (Frontend)
Required in all fetch requests to send cookies cross-origin:
```typescript
fetch(url, {
  credentials: 'include',  // Critical!
  ...
})
```

### 2. `allow_credentials=True` (Backend CORS)
Must be `True` to accept cookies cross-origin:
```python
CORSMiddleware(
    allow_credentials=True,  # Must be True!
    ...
)
```

### 3. `SameSite=lax` (Cookie)
Allows cookies in cross-site top-level navigations:
```python
response.set_cookie(
    samesite="lax",  # Allows cross-origin with credentials
    ...
)
```

### 4. `secure` Flag (Cookie)
- **Development**: `secure=False` (allows HTTP)
- **Production**: `secure=True` (HTTPS only)

## Testing

### Test Cookie Setting (Backend)

```bash
# Test login endpoint and verify Set-Cookie header
curl -X POST http://localhost:8003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v 2>&1 | grep "set-cookie"

# Expected output:
# set-cookie: access_token=eyJ...; HttpOnly; Max-Age=1800; Path=/; SameSite=lax
```

### Test Cookie Sending (Frontend)

```bash
# Check API configuration
grep -n "credentials" frontend/utils/api.ts

# Expected: credentials: 'include' on line ~100
```

### Test CORS Headers

```bash
# Test CORS preflight
curl -X OPTIONS http://localhost:8003/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | grep "Access-Control"

# Expected:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Credentials: true
```

## Troubleshooting

### Still Getting 401 Errors?

1. **Check browser console** for CORS errors
2. **Verify cookies are being set**:
   - Open DevTools → Application → Cookies
   - Check if `access_token` cookie exists after login
3. **Verify cookies are being sent**:
   - Open DevTools → Network → Select API request
   - Check "Request Headers" for `Cookie: access_token=...`
4. **Check environment variables**:
   - Backend: `ENVIRONMENT`, `SECRET_KEY`, `CORS_ORIGINS`
   - Frontend: `NEXT_PUBLIC_API_BASE_URL`

### Common Issues

| Issue | Solution |
|-------|----------|
| Cookie not set | Check `secure` flag matches protocol (HTTP vs HTTPS) |
| Cookie not sent | Verify `credentials: 'include'` in frontend |
| CORS error | Verify `allow_credentials=True` in backend |
| 401 after login | Check `SECRET_KEY` is same across restarts |

## Security Considerations

1. **Always use HTTPS in production** - Required when `secure=True`
2. **Generate strong SECRET_KEY** - Use `python -c "import secrets; print(secrets.token_urlsafe(32))"`
3. **Set appropriate cookie expiration** - Currently 30 minutes
4. **Use HttpOnly cookies** - Prevents XSS attacks (already configured)
5. **Limit CORS origins** - Don't use `*` with credentials

## Deployment Checklist

- [ ] Set `ENVIRONMENT=production` in backend
- [ ] Generate and set strong `SECRET_KEY`
- [ ] Update `CORS_ORIGINS` with production frontend URL
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` to production backend URL
- [ ] Ensure backend uses HTTPS
- [ ] Test login flow end-to-end
- [ ] Verify cookies are sent with API requests
- [ ] Test token refresh/expiry handling
