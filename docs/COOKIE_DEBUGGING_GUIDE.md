# 🔍 Cookie Authentication Debugging Guide

## Problem Summary
- ✅ Login works on deployed frontend
- ❌ Subsequent API calls return 401 Unauthorized
- 🔄 Retry mechanism triggers
- ✅ Everything works on localhost

**Root Cause:** Cookies are not being sent with requests in production.

---

## 🎯 Quick Diagnosis

### Step 1: Check Browser DevTools

1. **Open your deployed frontend**
2. **Open DevTools** (F12 or Right-click → Inspect)
3. **Go to Network tab**
4. **Clear filters** (make sure "All" is selected)
5. **Login to your app**
6. **Watch the network requests**

### What to Look For:

#### ✅ Working (Localhost):
```
Request URL: http://localhost:8000/api/tasks/
Request Method: GET
Status Code: 200 OK

Request Headers:
  Cookie: access_token=eyJhbGc...  ← Cookie is present!
```

#### ❌ Broken (Production):
```
Request URL: https://your-api.com/api/tasks/
Request Method: GET
Status Code: 401 Unauthorized

Request Headers:
  Cookie:  ← Cookie is MISSING!
```

---

## 🔬 **Verification Steps**

### 1. Check if Cookie is Set After Login

**In DevTools → Network tab:**

1. Find the **login request** (`POST /api/auth/login`)
2. Click on it
3. Go to **Headers** tab
4. Scroll down to **Response Headers**
5. Look for:

```
Set-Cookie: access_token=eyJhbGc...; Path=/; HttpOnly; Secure; SameSite=Lax
                                            ↑      ↑
                                    Must be present in production
```

**If `Set-Cookie` is missing:**
- Backend is not setting the cookie
- Check backend logs
- Verify `create_session_cookie()` is being called

**If `Set-Cookie` is present but cookie not sent later:**
- Continue to step 2

---

### 2. Check if Cookie is Sent with Subsequent Requests

**In DevTools → Network tab:**

1. Find a **subsequent request** (e.g., `GET /api/tasks/`)
2. Click on it
3. Go to **Headers** tab
4. Look at **Request Headers**
5. Find the **Cookie** header

```
Cookie: access_token=eyJhbGc...  ← Should be here
```

**If Cookie header is missing:**
- Browser is not sending the cookie
- Likely a CORS or domain mismatch issue
- Continue to step 3

---

### 3. Check Application Tab (Chrome) / Storage Tab (Firefox)

**Chrome:**
1. DevTools → **Application** tab
2. Left sidebar → **Cookies**
3. Select your **backend domain**

**Firefox:**
1. DevTools → **Storage** tab
2. Left sidebar → **Cookies**
3. Select your **backend domain**

**What you should see:**
```
Name          Value                    Domain              Path    Secure    HttpOnly
access_token  eyJhbGc...               api.yourdomain.com  /       ✓         ✓
```

**Check these columns:**

| Column | What to Check | Production Requirement |
|--------|---------------|------------------------|
| **Domain** | Must match your backend API domain | Must be exact match or parent domain |
| **Path** | Should be `/` | `/` allows all paths |
| **Secure** | Should be ✓ (checked) | **MUST be checked in production** |
| **HttpOnly** | Should be ✓ (checked) | Prevents JavaScript access |
| **SameSite** | Should be `Lax` or `None` | `Lax` for same-site, `None` for cross-origin |

---

## 🎯 **Common Issues & Solutions**

### Issue #1: Domain Mismatch ❌

**Problem:**
```
Frontend: https://app.yourdomain.com
Backend:  https://api.yourdomain.com
Cookie Domain: localhost  ← Wrong!
```

**Solution:**

**Backend (app.py):**
```python
# Update CORS to include production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.yourdomain.com",  # Your frontend domain
        "https://multi-phase-todo-app.vercel.app",
    ],
    allow_credentials=True,  # MUST be True
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie", "Authorization"]  # Expose these headers
)
```

**Backend (security.py):**
```python
def create_session_cookie(response, token: str, is_production: bool = True):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,  # MUST be True in production (HTTPS)
        samesite="lax",  # or "none" for cross-origin
        domain=".yourdomain.com",  # Optional: parent domain
        path="/",  # Available everywhere
        max_age=1800,
    )
```

---

### Issue #2: Secure Flag Not Set ❌

**Problem:**
```
Set-Cookie: access_token=...; HttpOnly; SameSite=Lax
            ↑ Missing Secure flag
```

**Why it fails:**
- Modern browsers **block insecure cookies on HTTPS sites**
- Production uses HTTPS
- Cookie without `Secure` flag won't be sent

**Solution:**

**Backend (security.py):**
```python
def create_session_cookie(response, token: str):
    is_production = os.getenv("ENVIRONMENT") == "production"
    
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=is_production,  # ✓ True in production
        samesite="lax",
        max_age=1800
    )
```

---

### Issue #3: CORS Not Configured Properly ❌

**Problem:**
```
Frontend: https://your-app.vercel.app
Backend:  https://your-api.com
CORS: Only allows localhost:3000  ← Missing production frontend!
```

**Solution:**

**Backend (app.py):**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "http://localhost:3001",
        "https://your-app.vercel.app",  # ← Add your production frontend
        "https://yourdomain.com",
    ],
    allow_credentials=True,  # ← MUST be True for cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["Set-Cookie", "Authorization"]  # ← Expose these
)
```

---

### Issue #4: Frontend Not Sending Credentials ❌

**Problem:**
```javascript
// Frontend API call
fetch('https://api.com/api/tasks/', {
  method: 'GET',
  // Missing credentials
})
```

**Solution:**

**Frontend (utils/api.ts or wherever you make API calls):**
```typescript
// Add credentials: 'include' to all requests
const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
  method: 'GET',
  credentials: 'include',  // ← MUST include for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**If using Axios:**
```typescript
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // ← MUST be true for cookies
});
```

---

### Issue #5: SameSite Attribute Too Restrictive ❌

**Problem:**
```
Set-Cookie: access_token=...; Secure; SameSite=Strict
                                    ↑ Blocks cross-origin requests
```

**Why it fails:**
- `SameSite=Strict` blocks ALL cross-origin requests
- Frontend and backend are on different domains
- Cookie never sent

**Solution:**

**Backend (security.py):**
```python
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    secure=True,
    samesite="lax",  # ← Use "lax" instead of "strict"
    # OR for cross-origin:
    # samesite="none",  # Requires Secure=True
    max_age=1800
)
```

**SameSite Values:**
- `Strict`: Never send cookie cross-origin (too restrictive)
- `Lax`: Send with top-level navigations (recommended)
- `None`: Always send (requires Secure=True)

---

## 🧪 **Testing Checklist**

### Local Testing (Before Deployment)

```bash
# 1. Test with production-like settings
export ENVIRONMENT=production
export SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')

# 2. Start backend
uvicorn app:app --host 0.0.0.0 --port 8000

# 3. Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}' \
  -v

# Look for Set-Cookie in response headers
```

### Production Testing

```bash
# 1. Test login endpoint
curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}' \
  -v

# Should see:
# Set-Cookie: access_token=...; Secure; HttpOnly; SameSite=Lax

# 2. Test protected endpoint with cookie
curl -X GET https://your-api.com/api/tasks/ \
  -H "Cookie: access_token=YOUR_TOKEN_FROM_LOGIN" \
  -v

# Should see:
# HTTP/2 200 (not 401)
```

---

## 🔧 **Debug Script for Frontend**

Add this to your deployed frontend temporarily:

**Create a test page:** `/frontend/app/debug/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Check cookies
    const cookies = document.cookie;
    
    // Test API call
    fetch('https://your-api.com/api/auth/me', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => ({
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
      }))
      .then(data => {
        setDebugInfo({
          cookies,
          apiResponse: data,
          timestamp: new Date().toISOString(),
          frontendUrl: window.location.href,
        });
      })
      .catch(err => {
        setDebugInfo({
          cookies,
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      });
  }, []);

  return (
    <div className="p-8">
      <h1>Debug Information</h1>
      <pre className="bg-gray-100 p-4 rounded mt-4">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
```

**Access:** `https://your-app.vercel.app/debug`

---

## 📊 **Backend Logging**

Add logging to backend to see what's happening:

**Backend (src/api/auth.py):**
```python
import logging
logger = logging.getLogger(__name__)

@router.post("/login")
def login(
    request: Request,
    response: Response,
    user_credentials: UserLogin,
    session: Session = Depends(get_session)
):
    logger.info(f"Login attempt from: {request.client.host}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    result = login_user(response, user_credentials.email, user_credentials.password, session)
    
    # Log cookie being set
    logger.info(f"Setting session cookie for user: {user_credentials.email}")
    
    return result
```

**Check backend logs:**
```bash
# If using systemd
sudo journalctl -u todo-backend -f

# If using Docker
docker logs -f your-container

# If using PM2
pm2 logs todo-backend
```

---

## ✅ **Solution Verification**

After applying fixes:

### 1. Clear Browser Cookies
```
DevTools → Application → Cookies → Clear All
```

### 2. Hard Refresh
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 3. Test Login Flow
1. Login via frontend
2. Check Network tab for login request
3. Verify `Set-Cookie` in response
4. Make another API call
5. Verify `Cookie` in request headers
6. Should get 200 OK (not 401)

---

## 🎯 **Most Likely Solution**

Based on your symptoms, the issue is **90% likely** to be one of these:

### #1: Frontend Not Sending Credentials (Most Likely)
```typescript
// In your frontend API utility
// ADD THIS:
credentials: 'include'  // or withCredentials: true for Axios
```

### #2: Backend CORS Missing Production Domain
```python
# In app.py
allow_origins=[
    "https://your-deployed-frontend.vercel.app",  # ← Add this
]
allow_credentials=True,  # ← Must be True
```

### #3: Cookie Secure Flag
```python
# In security.py
secure=True  # ← Must be True for HTTPS
```

---

## 📞 **Next Steps**

1. **Run the diagnosis steps above**
2. **Check DevTools Network tab**
3. **Verify cookie is set after login**
4. **Verify cookie is sent with requests**
5. **Check CORS configuration**
6. **Check frontend credentials setting**

**If still stuck:**
- Share screenshots from DevTools Network tab
- Share your frontend API call code
- Share your backend CORS configuration
- Share cookie details from Application tab

---

**Last Updated:** February 25, 2026  
**Status:** 🔍 Debug in Progress
