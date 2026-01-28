# Quickstart Guide: Modern Frontend UI Upgrade for 2026

## Overview
This guide provides instructions for setting up and running the modernized UI components in the existing application.

## Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher (or yarn/bun)
- Access to existing backend APIs
- Git for version control

## Setup Instructions

### 1. Clone and Navigate to Project
```bash
git clone <repository-url>
cd frontend
```

### 2. Install Dependencies
```bash
npm install
# OR
yarn install
```

### 3. Install New UI Dependencies
```bash
npm install framer-motion @mui/material @emotion/react @emotion/styled @hookform/resolvers zod zodResolver
npm install -D @types/node
```

### 4. Environment Configuration
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Modern Todo App
```

## Running the Application

### Development Mode
```bash
npm run dev
# OR
yarn dev
```
The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm run start
```

## Key Components

### 1. Theme Provider
The application uses a theme provider to manage light/dark themes:

```jsx
import { ThemeProvider } from '../contexts/ThemeContext';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

### 2. Animated Components
Using Framer Motion for animations with <100ms durations:

```jsx
import { motion } from 'framer-motion';

const AnimatedCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.08 }} // <100ms as required
  >
    {/* Card content */}
  </motion.div>
);
```

### 3. Form Handling
Using React Hook Form with Zod validation for real-time validation:

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Enables real-time validation as user types
    defaultValues: { title: '', description: '' },
  });

  // Form implementation
};
```

## Theming

### Switching Themes
The theme can be switched using the theme context:

```jsx
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { themeMode, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {themeMode === 'light' ? 'dark' : 'light'} mode
    </button>
  );
};
```

### Customizing Colors
Colors can be customized in the theme configuration to meet WCAG 2.1 AA standards:

```jsx
// themes/light-theme.js
export const lightTheme = {
  palette: {
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  // ...other theme properties
};
```

## Testing

### Unit Tests
```bash
npm run test
# OR
yarn test
```

### Component Tests
```bash
npm run test:components
# OR
yarn test:components
```

### E2E Tests
```bash
npm run test:e2e
# OR
yarn test:e2e
```

## Deployment

### Building for Production
```bash
npm run build
```

### Docker Deployment
```bash
docker build -t modern-frontend .
docker run -p 3000:3000 modern-frontend
```

## Troubleshooting

### Common Issues
1. **Animations not meeting <100ms requirement**: Ensure Framer Motion transition durations are set appropriately
2. **Theme not applying**: Verify ThemeProvider is correctly wrapping the application
3. **Form validation not happening in real-time**: Check that `mode: 'onChange'` is set in the form options
4. **Accessibility issues**: Ensure all UI components meet WCAG 2.1 AA standards

### Performance Tips
- Use `memo()` for components that render frequently
- Implement proper loading states for async operations
- Optimize images with Next.js Image component
- Use code splitting for large components
- Ensure all animations complete within <100ms as specified