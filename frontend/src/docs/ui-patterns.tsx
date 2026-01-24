// Documentation with new UI patterns and usage examples
import React from 'react';

// Documentation for the new UI patterns implemented in the modern UI upgrade

// 1. Theme Switching Pattern
export const ThemeSwitchingDocumentation = () => {
  return (
    <div>
      <h2>Theme Switching Pattern</h2>
      <p>
        Our application supports both light and dark themes with seamless switching.
        The theme preference is persisted across sessions using localStorage.
      </p>
      
      <h3>Usage:</h3>
      <pre>
        {`import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { themeMode, toggleTheme } = useTheme();
  
  return (
    <div className={themeMode === 'dark' ? 'dark-theme' : 'light-theme'}>
      <button onClick={toggleTheme}>
        Switch to {themeMode === 'light' ? 'dark' : 'light'} mode
      </button>
    </div>
  );
};`}
      </pre>
      
      <h3>Best Practices:</h3>
      <ul>
        <li>Always respect user's system preference as default</li>
        <li>Persist user's choice in localStorage</li>
        <li>Provide smooth transitions between themes</li>
        <li>Ensure all UI elements adapt properly to both themes</li>
      </ul>
    </div>
  );
};

// 2. Animation Pattern
export const AnimationDocumentation = () => {
  return (
    <div>
      <h2>Animation Pattern</h2>
      <p>
        We use Framer Motion for smooth, performant animations that complete 
        within 100ms to ensure a snappy user experience.
      </p>
      
      <h3>Usage:</h3>
      <pre>
        {`import { motion } from 'framer-motion';

const AnimatedCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.08 }} // <100ms as required
    >
      <Card>Content goes here</Card>
    </motion.div>
  );
};`}
      </pre>
      
      <h3>Best Practices:</h3>
      <ul>
        <li>All animations should complete within 100ms</li>
        <li>Respect user's reduced motion preference</li>
        <li>Use transform and opacity for performant animations</li>
        <li>Provide meaningful animations that enhance UX</li>
      </ul>
    </div>
  );
};

// 3. Form Handling Pattern
export const FormHandlingDocumentation = () => {
  return (
    <div>
      <h2>Form Handling Pattern</h2>
      <p>
        We use React Hook Form combined with Zod for type-safe, 
        real-time form validation.
      </p>
      
      <h3>Usage:</h3>
      <pre>
        {`import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
});

type FormData = z.infer<typeof formSchema>;

const MyForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Enables real-time validation
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
      
      <input {...form.register('email')} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
};`}
      </pre>
      
      <h3>Best Practices:</h3>
      <ul>
        <li>Use real-time validation (mode: 'onChange')</li>
        <li>Provide clear, helpful error messages</li>
        <li>Ensure forms are accessible with proper ARIA attributes</li>
        <li>Handle loading and success states appropriately</li>
      </ul>
    </div>
  );
};

// 4. State Management Pattern
export const StateManagementDocumentation = () => {
  return (
    <div>
      <h2>State Management Pattern</h2>
      <p>
        We use React Context for global state and custom hooks for component-specific state.
        For complex state logic, we use useReducer pattern.
      </p>
      
      <h3>Usage:</h3>
      <pre>
        {`import { createContext, useContext, useReducer } from 'react';

interface State {
  user: User | null;
  loading: boolean;
}

type Action = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: State = {
  user: null,
  loading: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const StateContext = createContext<State | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a StateProvider');
  }
  return context;
};`}
      </pre>
      
      <h3>Best Practices:</h3>
      <ul>
        <li>Use Context for global state that many components need</li>
        <li>Custom hooks for reusable state logic</li>
        <li>useReducer for complex state transitions</li>
        <li>Consider performance implications of Context updates</li>
      </ul>
    </div>
  );
};

// 5. Accessibility Pattern
export const AccessibilityDocumentation = () => {
  return (
    <div>
      <h2>Accessibility Pattern</h2>
      <p>
        Our UI follows WCAG 2.1 AA guidelines with proper semantic markup, 
        keyboard navigation, and ARIA attributes.
      </p>
      
      <h3>Usage:</h3>
      <pre>
        {`import { useAriaLiveAnnouncer } from '../lib/a11y';

const MyComponent = () => {
  const { announce } = useAriaLiveAnnouncer();
  
  const handleClick = () => {
    // Perform action
    announce('Item added successfully', 'polite');
  };

  return (
    <button onClick={handleClick} aria-label="Add new item">
      Add Item
    </button>
  );
};`}
      </pre>
      
      <h3>Best Practices:</h3>
      <ul>
        <li>Ensure sufficient color contrast (4.5:1 for normal text)</li>
        <li>Provide keyboard navigation support</li>
        <li>Use proper ARIA attributes when needed</li>
        <li>Test with screen readers</li>
        <li>Respect user's reduced motion preference</li>
      </ul>
    </div>
  );
};

// Main documentation component
export const UIDocumentation = () => {
  return (
    <div className="documentation">
      <h1>Modern UI Patterns Documentation</h1>
      <p>
        This documentation covers the new UI patterns implemented in our modern UI upgrade.
        These patterns ensure consistency, accessibility, and performance across the application.
      </p>
      
      <ThemeSwitchingDocumentation />
      <AnimationDocumentation />
      <FormHandlingDocumentation />
      <StateManagementDocumentation />
      <AccessibilityDocumentation />
    </div>
  );
};

// Export all documentation components
export default {
  ThemeSwitchingDocumentation,
  AnimationDocumentation,
  FormHandlingDocumentation,
  StateManagementDocumentation,
  AccessibilityDocumentation,
  UIDocumentation,
};