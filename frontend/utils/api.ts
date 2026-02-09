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
  preferences?: {
    theme?: 'light' | 'dark';
  };
  createdAt: string;
  updatedAt: string;
}

// Base API configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// CORS and credentials configuration
const API_CONFIG: RequestInit = {
  credentials: 'include',
  mode: 'cors',
  headers: {
    ...DEFAULT_HEADERS,
  },
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Global variable to track ongoing token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: boolean) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(!!token);
    }
  });

  failedQueue = [];
};

/**
 * Wrapper for fetch requests with automatic error handling and retries
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  // Add credentials and CORS settings to all requests for cookie authentication
  const config: RequestInit = {
    credentials: 'include', // This ensures cookies are sent with requests
    mode: 'cors', // Enable CORS mode
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
  };

  try {
    let response = await fetch(url, config);

    // Handle 401 Unauthorized - likely means session expired
    if (response.status === 401) {
      // Attempt to refresh the token if possible
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry the original request once after token refresh
        const retryConfig: RequestInit = {
          credentials: 'include',
          mode: 'cors',
          ...options,
          headers: {
            ...DEFAULT_HEADERS,
            ...options.headers,
          },
        };
        const retryResponse = await fetch(url, retryConfig);
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
      // Try to get error message from response body
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = await response.json();
        if (errorBody.message) {
          errorMessage = errorBody.message;
        } else if (errorBody.detail) {
          errorMessage = errorBody.detail;
        }
      } catch (parseError) {
        // If we can't parse the error body, use the status code
        console.warn('Could not parse error response:', parseError);
      }
      
      throw new Error(errorMessage);
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
    const errorMessage = error.message || 'An error occurred while processing your request';
    toast.error(errorMessage);
    throw error;
  }
}

/**
 * Attempts to refresh the authentication token
 */
async function refreshToken(): Promise<boolean> {
  if (isRefreshing) {
    // If a refresh is already in progress, wait for it to complete
    return new Promise((resolve: (value: boolean) => void, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Include cookies for refresh
      headers: DEFAULT_HEADERS,
    });

    if (response.ok) {
      const result = await response.json();
      isRefreshing = false;
      processQueue(null, result.token || null);
      return true;
    } else {
      // If refresh fails, clear the queue and reject
      isRefreshing = false;
      processQueue(new Error('Token refresh failed'), null);
      return false;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    isRefreshing = false;
    processQueue(error, null);
    return false;
  }
}

// Authentication API functions
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Transform backend response to match frontend expectations
    if (response.user) {
      return {
        ...response.user,
        name: response.user.first_name ? `${response.user.first_name} ${response.user.last_name || ''}`.trim() : undefined,
        preferences: {
          theme: response.user.theme_preference
        }
      };
    }
    return response;
  },

  register: async (userData: RegisterData) => {
    const response = await apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Transform backend response to match frontend expectations
    if (response.user) {
      return {
        ...response.user,
        name: response.user.first_name ? `${response.user.first_name} ${response.user.last_name || ''}`.trim() : undefined,
        preferences: {
          theme: response.user.theme_preference
        }
      };
    }
    return response;
  },

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  getProfile: async () => {
    const response = await apiRequest<any>('/auth/me');

    // Transform backend response to match frontend expectations
    return {
      ...response,
      name: response.first_name ? `${response.first_name} ${response.last_name || ''}`.trim() : undefined,
      preferences: {
        theme: response.theme_preference || 'light' // Default to 'light' if not set
      }
    };
  },

  updateProfile: async (userData: Partial<User>) => {
    // Transform frontend data to match backend expectations
    const transformedData: any = {};
    
    if (userData.name !== undefined) {
      const nameParts = userData.name.split(' ');
      transformedData.first_name = nameParts[0];
      transformedData.last_name = nameParts.slice(1).join(' ') || null;
    }
    
    if (userData.preferences?.theme !== undefined) {
      transformedData.theme_preference = userData.preferences.theme;
    }

    const response = await apiRequest<any>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(transformedData),
    });

    // Transform backend response to match frontend expectations
    return {
      ...response,
      name: response.first_name ? 
        response.last_name ? 
          `${response.first_name} ${response.last_name}`.trim() : 
          response.first_name 
        : undefined,
      preferences: {
        theme: response.theme_preference || 'light' // Default to 'light' if not set
      }
    };
  },
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

// Helper function to transform task response from snake_case to camelCase
const transformTaskResponse = (task: any): Task => ({
  ...task,
  userId: task.user_id,
  dueDate: task.due_date,
  createdAt: task.created_at,
  updatedAt: task.updated_at,
  recurrence: task.recurrence ? {
    ...task.recurrence,
    pattern: task.recurrence.pattern,
    interval: task.recurrence.interval,
  } : undefined,
});

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
  getAll: async (filters?: {
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
    const response = await apiRequest<{ tasks: any[]; pagination: any }>(`/tasks${queryString ? '?' + queryString : ''}`);
    
    return {
      tasks: response.tasks.map(transformTaskResponse),
      pagination: response.pagination
    };
  },

  getById: async (id: string) => {
    const response = await apiRequest<any>(`/tasks/${id}`);
    return transformTaskResponse(response);
  },

  create: async (taskData: CreateTaskData & { userId?: string }) => {
    // Destructure userId separately to ensure it's included in the request
    const { userId, ...restTaskData } = taskData;
    
    // Format dates to ensure they're in ISO format
    const formattedTaskData = {
      ...restTaskData,
      dueDate: restTaskData.dueDate ? new Date(restTaskData.dueDate).toISOString() : undefined
    };
    
    // Create the payload with userId converted to user_id for backend compatibility
    const payload = userId ? { ...formattedTaskData, user_id: userId } : formattedTaskData;
    
    const response = await apiRequest<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    return transformTaskResponse(response);
  },

  update: async (id: string, taskData: UpdateTaskData & { userId?: string }) => {
    // Destructure userId separately to ensure it's included in the request if provided
    const { userId, ...restTaskData } = taskData;
    
    // Format dates to ensure they're in ISO format
    const formattedTaskData = {
      ...restTaskData,
      dueDate: restTaskData.dueDate ? new Date(restTaskData.dueDate).toISOString() : undefined
    };
    
    // Create the payload with userId converted to user_id for backend compatibility
    const payload = userId ? { ...formattedTaskData, user_id: userId } : formattedTaskData;
    
    const response = await apiRequest<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    
    return transformTaskResponse(response);
  },

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
  getAll: async () => {
    const response = await apiRequest<{ tags: any[] }>('/tags');
    // Transform snake_case to camelCase for all tags
    return {
      tags: response.tags.map(tag => ({
        ...tag,
        userId: tag.user_id,
        createdAt: tag.created_at,
        updatedAt: tag.updated_at,
      }))
    };
  },

  create: async (tagData: CreateTagData & { userId?: string }) => {
    // Prepare the tag data to send, including userId if provided
    // Destructure userId separately to ensure it's included in the request
    const { userId, ...restTagData } = tagData;

    // Create the payload with userId converted to user_id for backend compatibility
    const payload = userId ? { ...restTagData, user_id: userId } : restTagData;

    const response = await apiRequest<any>('/tags', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    // Transform snake_case to camelCase
    return {
      ...response,
      userId: response.user_id,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
    };
  },

  update: async (id: string, tagData: Partial<CreateTagData>) => {
    const response = await apiRequest<any>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tagData),
    });
    
    // Transform snake_case to camelCase
    return {
      ...response,
      userId: response.user_id,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
    };
  },

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