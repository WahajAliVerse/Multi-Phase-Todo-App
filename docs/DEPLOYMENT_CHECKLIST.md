# ✅ DEPLOYMENT CHECKLIST - Cross-Origin Cookie Fix

## 🎯 Root Cause Identified

**Problem:** Frontend (`vercel.app`) and Backend (`hf.space`) are on **different domains**

**Issue:** Cookies blocked by browser due to cross-origin restrictions

**Solution:** Two critical fixes applied:

---

## ✅ Fixes Applied

### Fix #1: Frontend - credentials: 'include' ✅
**File:** `/frontend/utils/api.ts`
**Status:** ✅ Applied (Line 100-103)
**Action:** Needs deployment to Vercel

### Fix #2: Backend - SameSite=None ✅
**File:** `/backend/todo-backend/src/core/security.py`
**Status:** ✅ Applied (Line 461, 502)
**Action:** Needs deployment to Hugging Face Spaces

---

## 🚀 Deployment Steps (DO THESE NOW)

### Step 1: Deploy Backend to Hugging Face Spaces

```bash
cd /home/wahaj-ali/Desktop/multi-phase-todo/backend/todo-backend

# Commit the SameSite fix
git add .
git commit -m "fix: set SameSite=None for cross-origin cookie authentication

- Change samesite='lax' to 'samesite=none' in cookie configuration
- Required for cross-origin requests (vercel.app → hf.space)
- Secure flag already set to True (required for SameSite=None)
- Fixes 401 Unauthorized errors on deployed frontend"

# Push to Hugging Face Spaces
git push origin main
```

**Wait for Hugging Face to deploy:**
- Go to: https://huggingface.co/spaces/wahaj-ali20/todo-backend
- Watch deployment status
- Wait for "Running" status

---

### Step 2: Deploy Frontend to Vercel

```bash
cd /home/wahaj-ali/Desktop/multi-phase-todo/frontend

# Commit the credentials fix
git add .
git commit -m "fix: force credentials:include in all API requests

- Move credentials: 'include' after ...options spread
- Ensures cookies are ALWAYS sent with cross-origin requests
- Critical for cookie-based authentication
- Fixes infinite 401 retry loop on production"

# Push to trigger Vercel deployment
git push origin main
```

**Wait for Vercel to deploy:**
- Go to: https://vercel.com/dashboard
- Find your project
- Wait for "Ready" status

---

### Step 3: Test After Deployment

1. **Clear ALL browser data:**
   ```
   DevTools → Application → Cookies → Clear all
   OR
   Ctrl+Shift+Delete → Clear cookies and site data
   ```

2. **Hard refresh frontend:**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. **Login to your app:**
   - Use your credentials
   - Should see successful login

4. **Open DevTools → Network tab:**

5. **Find login request:**
   ```
   POST /api/auth/login
   Status: 200 OK
   
   Response Headers:
   Set-Cookie: access_token=eyJhbGc...; Secure; HttpOnly; SameSite=None
                                                               ↑
                                              MUST say "None" not "Lax"
   ```

6. **Navigate to trigger another API call:**
   - Go to tasks page
   - Should see API requests succeeding

7. **Check tasks request:**
   ```
   GET /api/tasks/
   Status: 200 OK (NOT 401!)
   
   Request Headers:
   Cookie: access_token=eyJhbGc...  ← MUST BE PRESENT!
   ```

---

## ✅ Verification Checklist

After both deployments complete:

### Backend (Hugging Face Spaces)
- [ ] Backend deployed successfully
- [ ] `/api/auth/login` returns `Set-Cookie` header
- [ ] Cookie has `SameSite=None` attribute
- [ ] Cookie has `Secure` attribute
- [ ] CORS headers present:
  - `Access-Control-Allow-Origin: https://multi-phase-todo-app.vercel.app`
  - `Access-Control-Allow-Credentials: true`

### Frontend (Vercel)
- [ ] Frontend deployed successfully
- [ ] Login works without errors
- [ ] Subsequent API calls return 200 OK
- [ ] No 401 Unauthorized errors
- [ ] No retry loops
- [ ] Cookie header present in all API requests

### Browser
- [ ] Cookie visible in Application → Cookies tab
- [ ] Cookie domain matches backend domain
- [ ] Cookie path is `/`
- [ ] Cookie Secure flag is checked
- [ ] Cookie SameSite is "None"

---

## 🎯 Expected Behavior After Fix

### Login Flow:
```
1. User enters credentials
2. POST /api/auth/login
3. Backend responds: 200 OK + Set-Cookie: access_token=...; SameSite=None
4. Browser stores cookie
5. Frontend navigates to dashboard
```

### API Calls:
```
1. Frontend calls: GET /api/tasks/
2. Browser automatically includes: Cookie: access_token=...
3. Backend validates token
4. Backend responds: 200 OK + tasks data
5. Frontend displays tasks
```

### What You Should See:
- ✅ No 401 errors
- ✅ No retry loops
- ✅ Tasks load successfully
- ✅ All API calls work
- ✅ Cookie visible in DevTools

---

## 🧪 Debug Commands

### Test Backend Cookie (curl):
```bash
# Login and check Set-Cookie header
curl -X POST https://wahaj-ali20-todo-backend.hf.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"YourPassword"}' \
  -v 2>&1 | grep -i "set-cookie"

# Should see:
# set-cookie: access_token=...; Secure; HttpOnly; SameSite=None
```

### Test Full Flow (curl):
```bash
# Login and save cookies
curl -X POST https://wahaj-ali20-todo-backend.hf.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"YourPassword"}' \
  -c cookies.txt

# Use cookies to access protected endpoint
curl -X GET https://wahaj-ali20-todo-backend.hf.space/api/auth/me \
  -b cookies.txt \
  -v

# Should get: 200 OK with user data
```

---

## 🚨 If Still Not Working

### Check 1: Backend Deployment
```bash
# Check if backend has latest commit
curl -I https://wahaj-ali20-todo-backend.hf.space/api/health

# Check Hugging Face deployment logs
# Go to: https://huggingface.co/spaces/wahaj-ali20/todo-backend
```

### Check 2: Frontend Deployment
```bash
# Check Vercel deployment status
# Go to: https://vercel.com/dashboard
```

### Check 3: Browser Console
```javascript
// Open DevTools Console on deployed frontend
// Run after login:

console.log('Cookies:', document.cookie);
// Should show: access_token=...

fetch('https://wahaj-ali20-todo-backend.hf.space/api/auth/me', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
// Should log user data, not 401 error
```

### Check 4: Network Tab
```
1. Open DevTools → Network tab
2. Clear all (trash icon)
3. Login
4. Find login request
5. Check Response Headers for Set-Cookie
6. Navigate to trigger another request
7. Check Request Headers for Cookie
```

---

## 📊 Common Issues & Solutions

### Issue: Still seeing 401 after deployment

**Solution:**
1. Clear browser cookies completely
2. Hard refresh (Ctrl+Shift+R)
3. Check if both deployments completed successfully
4. Verify Set-Cookie header has SameSite=None

### Issue: Cookie not being set

**Solution:**
1. Check backend logs for errors
2. Verify login endpoint is returning Set-Cookie
3. Check browser is not blocking third-party cookies
4. Try in incognito mode

### Issue: Cookie set but not sent

**Solution:**
1. Verify frontend code has credentials: 'include'
2. Check Vercel deployment has latest code
3. Verify domain mismatch (should be hf.space)
4. Try clearing all site data

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Backend deployed with SameSite=None
2. ✅ Frontend deployed with credentials: 'include'
3. ✅ Login returns Set-Cookie header
4. ✅ Cookie has SameSite=None attribute
5. ✅ API requests include Cookie header
6. ✅ API returns 200 OK (not 401)
7. ✅ Data loads successfully
8. ✅ No errors in console

---

## 📞 Final Checklist

Before declaring victory:

- [ ] Backend code committed and pushed
- [ ] Frontend code committed and pushed
- [ ] Backend deployment completed on Hugging Face
- [ ] Frontend deployment completed on Vercel
- [ ] Browser cookies cleared
- [ ] Hard refresh performed
- [ ] Login tested successfully
- [ ] API calls return 200 OK
- [ ] Cookie visible in DevTools
- [ ] No 401 errors in Network tab
- [ ] No retry loops
- [ ] Data loads correctly

---

**Last Updated:** February 26, 2026  
**Status:** 🛠️ Fixes Applied, Ready to Deploy  
**Priority:** 🔴 CRITICAL - Deploy Immediately  
**Estimated Time:** 10-15 minutes for full deployment

---

## 🚀 Quick Deploy Commands

```bash
# Backend (Hugging Face Spaces)
cd /home/wahaj-ali/Desktop/multi-phase-todo/backend/todo-backend
git add .
git commit -m "fix: SameSite=None for cross-origin cookies"
git push

# Frontend (Vercel)
cd /home/wahaj-ali/Desktop/multi-phase-todo/frontend
git add .
git commit -m "fix: force credentials:include"
git push origin main

# Then wait for deployments and test!
```

**GOOD LUCK! 🍀**
