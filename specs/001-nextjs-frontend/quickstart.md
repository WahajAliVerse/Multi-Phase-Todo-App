# Quickstart Guide: Frontend Web Application

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Access to backend API endpoints
- Git for version control

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/v1
NEXT_PUBLIC_APP_NAME=Todo Application
NEXT_PUBLIC_DEFAULT_THEME=light
NEXT_PUBLIC_JWT_TOKEN_EXPIRY=3600
```

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to view the application.

## Project Structure
```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Authentication-related routes
│   │   │   ├── login/       # Login page
│   │   │   ├── register/    # Registration page
│   │   │   └── forgot-password/ # Password reset
│   │   ├── (dashboard)/     # Main application dashboard
│   │   │   ├── tasks/       # Task management
│   │   │   ├── profile/     # User profile
│   │   │   └── settings/    # User settings
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utility functions and helpers
│   │   ├── store/          # Redux store configuration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
│   ├── styles/             # Global styles and themes
│   └── public/             # Static assets
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/               # End-to-end tests
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Key Technologies Used
- **Next.js 14+**: React framework with App Router
- **TypeScript 5.x**: Type-safe JavaScript
- **Material UI (MUI)**: Component library
- **Redux Toolkit**: State management
- **React Query**: Server state management (optional, may be used alongside Redux)

## Development Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run test`: Run unit tests
- `npm run test:e2e`: Run end-to-end tests

## Creating New Components
1. Create a new component file in `src/app/components/`
2. Follow the naming convention: `ComponentName.tsx`
3. Use TypeScript interfaces for props
4. Export the component as default
5. Write unit tests in the corresponding `__tests__` directory

Example component:
```tsx
import { Button, ButtonProps } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary';
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  children, 
  variant = 'primary', 
  ...props 
}) => {
  return (
    <Button 
      variant={variant === 'primary' ? 'contained' : 'outlined'} 
      {...props}
    >
      {children}
    </Button>
  );
};
```

## API Integration
1. Create API service functions in `src/app/services/`
2. Use the API contract specifications as reference
3. Handle loading and error states appropriately
4. Use React Query or Redux Toolkit Query for server state management

Example API call:
```ts
// src/app/services/taskService.ts
import { Task } from '../types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  
  const result = await response.json();
  return result.data.tasks;
};
```

## State Management
1. Define Redux slices in `src/app/store/`
2. Use Redux Toolkit's `createSlice` for reducer logic
3. Define actions and selectors for each slice
4. Use `useSelector` and `useDispatch` hooks in components

Example slice:
```ts
// src/app/store/tasksSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types/task';

interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess: (state, action: PayloadAction<Task[]>) => {
      state.loading = false;
      state.items = action.payload;
    },
    fetchTasksFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure } = tasksSlice.actions;
export default tasksSlice.reducer;
```

## Authentication Flow
1. User logs in via `/auth/login` endpoint
2. JWT token is received and stored in localStorage
3. Token is included in Authorization header for protected API calls
4. Token expiry is checked before each request
5. User is redirected to login if token is expired

Example auth service:
```ts
// src/app/services/authService.ts
import { User } from '../types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const login = async (email: string, password: string): Promise<{user: User, token: string}> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const result = await response.json();
  // Store token in localStorage
  localStorage.setItem('authToken', result.data.token);
  return result.data;
};
```

## Testing
1. Write unit tests using Jest and React Testing Library
2. Place test files adjacent to the component with `.test.tsx` extension
3. Test component rendering, user interactions, and state changes
4. Mock API calls and external dependencies

Example test:
```tsx
// CustomButton.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { CustomButton } from './CustomButton';

describe('CustomButton', () => {
  it('renders correctly with primary variant', () => {
    const { getByText } = render(<CustomButton>Click me</CustomButton>);
    const button = getByText('Click me');
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('MuiButton-contained');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    const { getByText } = render(
      <CustomButton onClick={handleClick}>Click me</CustomButton>
    );
    
    fireEvent.click(getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Styling with MUI
1. Use MUI components wherever possible for consistency
2. Customize theme in `src/styles/theme.ts`
3. Use responsive props for mobile-first design
4. Follow accessibility guidelines

Example theme customization:
```ts
// src/styles/theme.ts
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    neutral: {
      main: '#f5f5f5',
      contrastText: '#000',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
```

## Deployment
1. Build the application: `npm run build`
2. The output will be in the `.next/` directory
3. Serve the application using a Node.js server or static hosting
4. Ensure environment variables are set in the deployment environment