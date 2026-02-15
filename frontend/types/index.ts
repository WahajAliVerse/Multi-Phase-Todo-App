// Define types for the application

// DTO interfaces (Backend representation - snake_case)
export interface TagDto {
  id: string;
  name: string;
  color: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  completed_at: string | null;
  user_id: string;
  tags?: string[]; // Array of tag IDs associated with the task
  created_at: string;
  updated_at: string;
}

export interface UserDto {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationDto {
  id: string;
  type: 'email' | 'browser' | 'push';
  title: string;
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  user_id: string;
  task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTagDto {
  name: string;
  color?: string | null;
  user_id: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string | null;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  tags?: string[]; // Array of tag IDs to associate with the task
  user_id: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  completed?: boolean;
  tags?: string[]; // Array of tag IDs to associate with the task
}

// Frontend models (camelCase)
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
  authenticationStatus?: 'authenticated' | 'unauthenticated' | 'pending'; // User's authentication status
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completedAt?: string;
  tags: string[]; // Array of tag IDs associated with the task
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
  token: string | null;
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