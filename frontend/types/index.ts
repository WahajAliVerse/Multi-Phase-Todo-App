// Define types for the application

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  preferences?: {
    theme?: 'light' | 'dark';
  };
  createdAt: string;
  updatedAt: string;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  userId: string;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  taskCount?: number; // Number of tasks associated with this tag
  createdAt: string;
  updatedAt: string;
}

// Theme types
export type ThemeMode = 'light' | 'dark';

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  duration?: number;
}

// Modal state types
export type ModalMode = 0 | 1; // 0 = create, 1 = edit
export type ModalEntityType = 'task' | 'tag' | 'user';

export interface ModalState {
  mode: ModalMode;
  entityType: ModalEntityType;
  entityId?: string;
  isOpen: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Redux State types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: {
    status: 'all' | 'active' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'all';
    tag: string | 'all';
  };
}

export interface TagsState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

export interface UiState {
  notifications: Notification[];
  modal: ModalState;
  loading: boolean;
  error: string | null;
}