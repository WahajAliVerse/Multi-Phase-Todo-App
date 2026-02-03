# Quickstart Guide: Frontend Updates for Recurrence, Reminders, and Tags

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Access to the backend API with recurrence, reminder, and tag functionality

## Setup Environment
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API endpoint and other config
   ```

## Development
1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Visit `http://localhost:3000` in your browser

## Key Implementation Areas

### 1. Implement Core Types
- Define TypeScript interfaces in `src/lib/types.ts`
- Include Task, Tag, RecurrencePattern, and Reminder interfaces
- Add validation schemas using Zod

### 2. Set Up State Management
- Configure Redux store in `src/store/store.ts`
- Create slices for tasks, tags, recurrence, and reminders in `src/store/slices/`
- Set up RTK Query API service in `src/lib/api.ts`

### 3. Build Components
- Create TagSelector component (`src/components/TagSelector.tsx`)
- Build RecurrenceEditor component (`src/components/RecurrenceEditor.tsx`)
- Develop ReminderSetter component (`src/components/ReminderSetter.tsx`)

### 4. Integrate with Existing UI
- Extend TaskForm to include new features (`src/components/TaskForm.tsx`)
- Update TaskCard to display new information (`src/components/TaskCard.tsx`)
- Enhance task filtering and search capabilities

### 5. Implement Timezone Handling
- Use date-fns-tz for timezone conversions
- Store all times in UTC
- Display times in user's local timezone

## Testing
1. Run unit tests:
   ```bash
   npm run test
   # or
   yarn test
   ```

2. Run end-to-end tests:
   ```bash
   npm run test:e2e
   # or
   yarn test:e2e
   ```

## Building for Production
```bash
npm run build
# or
yarn build
```

## Deployment
1. Build the application
2. Serve the `out` directory using your preferred web server
3. Ensure environment variables are set for the target environment