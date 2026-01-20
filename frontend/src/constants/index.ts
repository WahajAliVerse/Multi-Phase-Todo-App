// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Task Status Constants
export const TASK_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

// Task Priority Constants
export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  THEME_PREFERENCE: 'theme-preference',
  AUTH_TOKEN: 'auth-token',
} as const;

// Default Values
export const DEFAULT_THEME = 'light';