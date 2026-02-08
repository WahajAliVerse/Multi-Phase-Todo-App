import { toast } from 'react-hot-toast';

// Define types for API responses
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Define types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

// Base API configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Wrapper for fetch requests with automatic error handling and retries
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Add credentials to all requests for cookie authentication
  const config: RequestInit = {
    credentials: 'include', // This ensures cookies are sent with requests
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized - likely means session expired
    if (response.status === 401) {
      // Attempt to refresh the token if possible
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry the original request once after token refresh
        const retryResponse = await fetch(url, config);
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return await retryResponse.json();
      } else {
        // Redirect to login if refresh failed
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error(`API request failed for ${url}:`, error);
    
    // If we still have retries left and the error isn't a 401, try again
    if (retries > 0 && error.message && !error.message.includes('401')) {
      console.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return apiRequest<T>(endpoint, options, retries - 1);
    }
    
    // Show error toast
    toast.error(error.message || 'An error occurred while processing your request');
    throw error;
  }
}

/**
 * Attempts to refresh the authentication token
 */
async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Include cookies for refresh
      headers: DEFAULT_HEADERS,
    });
    
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// Authentication API functions
export const authApi = {
  login: (credentials: LoginCredentials) => 
    apiRequest<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (userData: RegisterData) => 
    apiRequest<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  logout: () => 
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
  
  getProfile: () => 
    apiRequest<User>('/auth/profile'),
  
  updateProfile: (userData: Partial<User>) => 
    apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
};

// Tasks API functions
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

export interface CreateTaskData {
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

export interface UpdateTaskData extends Partial<CreateTaskData> {
  completed?: boolean;
}

export const tasksApi = {
  getAll: (filters?: {
    status?: 'all' | 'active' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    tag?: string;
    search?: string;
    sort?: 'dueDate' | 'priority' | 'createdAt';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiRequest<{ tasks: Task[]; pagination: any }>(`/tasks${queryString ? '?' + queryString : ''}`);
  },

  getById: (id: string) => 
    apiRequest<Task>(`/tasks/${id}`),

  create: (taskData: CreateTaskData) => 
    apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  update: (id: string, taskData: UpdateTaskData) => 
    apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),

  delete: (id: string) => 
    apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};

// Tags API functions
export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagData {
  name: string;
  color?: string;
}

export const tagsApi = {
  getAll: () => 
    apiRequest<{ tags: Tag[] }>('/tags'),

  create: (tagData: CreateTagData) => 
    apiRequest<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(tagData),
    }),

  update: (id: string, tagData: Partial<CreateTagData>) => 
    apiRequest<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tagData),
    }),

  delete: (id: string) => 
    apiRequest(`/tags/${id}`, {
      method: 'DELETE',
    }),
};

// Reminders API functions
export interface Reminder {
  id: string;
  taskId: string;
  taskTitle: string;
  dueDate: string;
  triggered: boolean;
  createdAt: string;
}

export const remindersApi = {
  getUpcoming: () => 
    apiRequest<{ reminders: Reminder[] }>('/reminders/upcoming'),
};