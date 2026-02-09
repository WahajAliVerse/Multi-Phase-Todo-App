# Quickstart Guide: Frontend Debug Fixes

## Prerequisites
- Node.js 18+ or Bun 1.0+
- Access to backend API (FastAPI + SQLModel + Neon DB)
- HTTP-only cookie authentication enabled

## Setup
1. Clone the repository
2. Install dependencies: `bun install` or `npm install`
3. Set up environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```
4. Run the development server: `bun run dev` or `npm run dev`

## Running the Fixes
The fixes are implemented as targeted changes to existing components and services:

### 1. Tags Rendering Fix
- Located in: `components/common/TaskCard.tsx`
- Updates tag rendering to use TagChip components with proper colors
- Ensures tags are fetched and mapped correctly from Redux state

### 2. Date Conversion Fix
- Located in: `components/forms/TaskForm.tsx`
- Properly converts date inputs to ISO 8601 format before API submission
- Handles timezone offsets appropriately

### 3. User ID Attachment Fix
- Located in: `redux/slices/tagsSlice.ts`
- Automatically attaches authenticated user's ID when creating tags
- Uses Redux state to access user ID

### 4. Session Persistence Fix
- Located in: `components/providers/AuthInitializer.tsx`
- Ensures user data is reloaded on page refresh
- Maintains authentication state across navigation

### 5. CORS Configuration Fix
- Located in: `utils/api.ts`
- Ensures proper credentials and CORS settings for all API requests
- Maintains cookie authentication integrity

## Testing the Fixes
1. Start the development server
2. Log in to the application
3. Test each fixed functionality:
   - Create tasks with due dates
   - Create and assign tags to tasks
   - Refresh the page to verify session persistence
   - Check browser console for CORS errors
4. Verify all existing functionality remains intact

## Building for Production
```bash
bun run build
```

## Troubleshooting
- If tags still don't appear, ensure the backend `/tags` endpoint returns proper tag objects
- If date errors persist, check browser console for specific error messages
- For authentication issues, verify HTTP-only cookie settings match backend