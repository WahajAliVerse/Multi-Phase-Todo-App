# Quickstart Guide: Frontend Modern UI Upgrade

## Prerequisites

- Node.js 18+ (or latest LTS)
- Bun package manager (install via `curl -fsSL https://bun.sh/install | bash`)
- Access to the backend API (FastAPI with HTTP-only cookie authentication)

## Setup Instructions

### 1. Clone and Navigate to Project
```bash
cd frontend/
```

### 2. Install Dependencies with Bun
```bash
bun install
```

### 3. Environment Configuration
Create a `.env.local` file in the frontend directory with the following variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_COOKIE_NAME=access_token
```

### 4. Run Development Server
```bash
bun run dev
```

The application will be available at `http://localhost:3000`

### 5. Build for Production
```bash
bun run build
```

### 6. Run Production Build
```bash
bun run start
```

## Key Scripts

- `bun run dev` - Start development server with hot reloading
- `bun run build` - Create optimized production build
- `bun run start` - Start production server
- `bun run lint` - Run ESLint to check for code issues
- `bun run test` - Run unit tests
- `bun run test:watch` - Run tests in watch mode

## Project Structure Overview

```
frontend/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── redux/               # Redux store and slices
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript definitions
└── public/              # Static assets
```

## Development Guidelines

1. **Component Development**: Place reusable components in the `components/` directory, organizing by functionality (ui, common, modals, forms, charts)

2. **State Management**: Use Redux Toolkit slices for global state, with async thunks for API interactions

3. **API Integration**: All API calls should go through the centralized API utility in `utils/api.ts` which handles authentication headers and error responses

4. **Form Handling**: Use React Hook Form with Zod schemas for validation, placing schemas in `utils/validators.ts`

5. **Styling**: Apply Tailwind CSS classes following the design system established in `globals.css`

6. **Type Safety**: Define TypeScript interfaces/types in the `types/` directory and use them consistently

## Important Notes

- The application uses HTTP-only cookie authentication, so all API requests must include credentials
- Theme preferences are persisted in localStorage
- The application implements optimistic updates for better user experience
- All forms use Zod for validation to ensure data integrity