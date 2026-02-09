import { Task, Tag } from './index';

// API response/request types

// Authentication API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name?: string;
  preferences?: {
    theme: 'light' | 'dark';
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  preferences?: {
    theme: 'light' | 'dark';
  };
}

// Tasks API types
export interface GetTasksParams {
  status?: 'all' | 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  tag?: string;
  search?: string;
  sort?: 'dueDate' | 'priority' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GetTasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
  };
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  completed?: boolean;
}

export interface TaskResponse {
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

// Tags API types
export interface GetTagsResponse {
  tags: Tag[];
}

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTagRequest extends Partial<CreateTagRequest> {}

export interface TagResponse {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Reminders API types
export interface Reminder {
  id: string;
  taskId: string;
  taskTitle: string;
  dueDate: string;
  triggered: boolean;
  createdAt: string;
}

export interface GetUpcomingRemindersResponse {
  reminders: Reminder[];
}