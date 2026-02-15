import { toast } from 'react-hot-toast';
import { redirectToLogin } from './auth';
import { 
  TagDto, 
  CreateTagDto, 
  UpdateTagDto, 
  Tag,
  UserDto,
  TaskDto,
  NotificationDto
} from '@/types';
import { 
  transformTagDtosToFrontendModels,
  transformTagDtoToFrontendModel,
  transformTaskDtoToFrontendModel,
  transformTaskDtosToFrontendModels,
  transformUserDtoToFrontendModel,
  transformUserDtosToFrontendModels,
  transformNotificationDtoToFrontendModel,
  transformNotificationDtosToFrontendModels
} from '@/utils/transformations';

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
// Update this to point to your deployed backend
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'; // Default to local backend
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Retry configuration
const MAX_RETRIES = 2; // Reduced to prevent excessive retries
const RETRY_DELAY = 500; // Reduced delay

// Custom error class for API errors
class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Function to handle unauthorized access
function handleUnauthorized() {
  redirectToLogin();
}

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

  // For local development, we need to ensure the cookie is sent even with different protocols
  if (process.env.NODE_ENV === 'development') {
    config.credentials = 'include';
  }

  try {
    let response = await fetch(url, config);

    // Handle 401 Unauthorized - likely means session expired
    if (response.status === 401) {
      // Redirect to login to re-authenticate
      handleUnauthorized();
      // Throw a specific error to prevent retries
      throw new ApiError('Session expired. Please log in again.', 401);
    }

    // Handle 404 for auth endpoints - means the user is not authenticated
    if (response.status === 404 && url.includes('/auth/me')) {
      // Don't treat this as an error - it's expected when not logged in
      // The auth slice will handle marking the user as not authenticated
      return await response.json();
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

      throw new ApiError(errorMessage, response.status);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API request failed for ${url}:`, error);

    // Check if this is a 401 error (authentication issue) - don't retry these
    const isAuthError = error instanceof ApiError && error.status === 401;

    // Also don't retry for 404 errors as these indicate the resource doesn't exist
    const isNotFoundError = error instanceof ApiError && error.status === 404;

    // If we still have retries left and the error is not an authentication or 404 error, try again
    if (retries > 0 && !isAuthError && !isNotFoundError) {
      console.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return apiRequest<T>(endpoint, options, retries - 1);
    }

    // Show error toast (but not for 401 or 404 errors since we handle these specially)
    if (!isAuthError && !isNotFoundError) {
      const errorMessage = error.message || 'An error occurred while processing your request';
      toast.error(errorMessage);
    }

    throw error;
  }
}

// Authentication API functions
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response: any = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Transform backend response to match frontend expectations
    if (response.user) {
      const transformedUser = transformUserDtoToFrontendModel(response.user);
      // Return both user and token if available
      return {
        user: transformedUser,
        token: response.token || null
      };
    }
    return response;
  },

  register: async (userData: RegisterData) => {
    const response: any = await apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Transform backend response to match frontend expectations
    if (response.user) {
      const transformedUser = transformUserDtoToFrontendModel(response.user);
      // Return both user and token if available
      return {
        user: transformedUser,
        token: response.token || null
      };
    }
    return response;
  },

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  getProfile: async () => {
    const response: any = await apiRequest<any>('/auth/me');

    // Transform backend response to match frontend expectations
    if (response.user) {
      const transformedUser = transformUserDtoToFrontendModel(response.user);
      // Return both user and token if available
      return {
        user: transformedUser,
        token: response.token || null
      };
    }
    return transformUserDtoToFrontendModel(response);
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

    const response: any = await apiRequest<any>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(transformedData),
    });

    // Transform backend response to match frontend expectations
    if (response.user) {
      const transformedUser = transformUserDtoToFrontendModel(response.user);
      // Return both user and token if available
      return {
        user: transformedUser,
        token: response.token || null
      };
    }
    return transformUserDtoToFrontendModel(response);
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
    const response = await apiRequest<{ tasks: TaskDto[]; pagination: any }>(`/tasks${queryString ? '?' + queryString : ''}`);

    // Check if response.tasks exists and is an array before mapping
    const tasksArray = Array.isArray(response.tasks) ? response.tasks : [];
    return {
      tasks: tasksArray.map(transformTaskDtoToFrontendModel),
      pagination: response.pagination
    };
  },

  getById: async (id: string) => {
    const response = await apiRequest<TaskDto>(`/tasks/${id}`);
    return transformTaskDtoToFrontendModel(response);
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
    // Also convert tags to tag_ids for backend compatibility
    const payload: any = userId ? { ...formattedTaskData, user_id: userId } : formattedTaskData;
    
    // If tags are provided, convert to tag_ids for backend
    if (restTaskData.tags && Array.isArray(restTaskData.tags)) {
      payload.tag_ids = restTaskData.tags; // Backend expects tag_ids field
    }

    const response = await apiRequest<TaskDto>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return transformTaskDtoToFrontendModel(response);
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
    // Also convert tags to tag_ids for backend compatibility
    const payload: any = userId ? { ...formattedTaskData, user_id: userId } : formattedTaskData;
    
    // If tags are provided, convert to tag_ids for backend
    if (restTaskData.tags && Array.isArray(restTaskData.tags)) {
      payload.tag_ids = restTaskData.tags; // Backend expects tag_ids field
    }

    const response = await apiRequest<TaskDto>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return transformTaskDtoToFrontendModel(response);
  },

  delete: (id: string) =>
    apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};

// Tags API functions
export interface CreateTagData {
  name: string;
  color?: string;
}

export const tagsApi = {
  getAll: async () => {
    console.log('Fetching tags...');
    // The API returns an array directly, not an object with a tags property
    const response = await apiRequest<TagDto[]>('/tags');
    console.log('Raw API response:', response);
    // Transform DTOs to frontend models
    // Since response is already an array, use it directly
    const tagsArray = Array.isArray(response) ? response : [];
    console.log('Tags array before transformation:', tagsArray);
    const transformedTags = transformTagDtosToFrontendModels(tagsArray);
    console.log('Transformed tags:', transformedTags);
    return transformedTags; // Return the array directly, not wrapped in an object
  },

  create: async (tagData: CreateTagData & { userId?: string }) => {
    console.log('Creating tag with data:', tagData);
    // Prepare the tag data to send, including userId if provided
    // Destructure userId separately to ensure it's included in the request
    const { userId, ...restTagData } = tagData;

    // Create the payload with userId converted to user_id for backend compatibility
    const payload: CreateTagDto = userId 
      ? { ...restTagData, user_id: userId } 
      : { ...restTagData } as CreateTagDto;

    const response: TagDto = await apiRequest<TagDto>('/tags', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Transform DTO to frontend model
    const result = transformTagDtoToFrontendModel(response);
    console.log('Tag created successfully:', result);
    return result;
  },

  update: async (id: string, tagData: Partial<CreateTagData>) => {
    console.log('Updating tag with id:', id, 'and data:', tagData);
    const response: TagDto = await apiRequest<TagDto>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tagData),
    });

    // Transform DTO to frontend model
    const result = transformTagDtoToFrontendModel(response);
    console.log('Tag updated successfully:', result);
    return result;
  },

  delete: (id: string) => {
    console.log('Deleting tag with id:', id);
    return apiRequest(`/tags/${id}`, {
      method: 'DELETE',
    });
  },
};

// Notifications API functions
export interface CreateNotificationData {
  type: 'email' | 'browser' | 'push';
  title: string;
  message: string;
  userId: string;
  taskId?: string;
}

export const notificationsApi = {
  getAll: async (filters?: {
    status?: 'sent' | 'delivered' | 'read' | 'failed';
    type?: 'email' | 'browser' | 'push';
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }) => {
    console.log('Fetching notifications...');
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const response = await apiRequest<{ notifications: NotificationDto[]; pagination: any }>(
      `/notifications${queryString ? '?' + queryString : ''}`
    );

    // Transform DTOs to frontend models
    const notificationsArray = Array.isArray(response.notifications) ? response.notifications : [];
    const result = {
      notifications: transformNotificationDtosToFrontendModels(notificationsArray),
      pagination: response.pagination
    };
    console.log('Notifications fetched successfully:', result.notifications.length);
    return result;
  },

  create: async (notificationData: CreateNotificationData) => {
    console.log('Creating notification with data:', notificationData);
    const response: NotificationDto = await apiRequest<NotificationDto>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });

    // Transform DTO to frontend model
    const result = transformNotificationDtoToFrontendModel(response);
    console.log('Notification created successfully:', result);
    return result;
  },

  update: async (id: string, notificationData: Partial<CreateNotificationData>) => {
    console.log('Updating notification with id:', id, 'and data:', notificationData);
    const response: NotificationDto = await apiRequest<NotificationDto>(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(notificationData),
    });

    // Transform DTO to frontend model
    const result = transformNotificationDtoToFrontendModel(response);
    console.log('Notification updated successfully:', result);
    return result;
  },

  delete: (id: string) => {
    console.log('Deleting notification with id:', id);
    return apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  markAsRead: async (id: string) => {
    console.log('Marking notification as read:', id);
    const response: NotificationDto = await apiRequest<NotificationDto>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });

    // Transform DTO to frontend model
    const result = transformNotificationDtoToFrontendModel(response);
    console.log('Notification marked as read:', result);
    return result;
  },
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