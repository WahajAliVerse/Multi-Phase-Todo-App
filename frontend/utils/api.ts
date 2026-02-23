import { toast } from 'react-hot-toast';
import { redirectToLogin } from './auth';
import {
  TagDto,
  CreateTagDto,
  UpdateTagDto,
  Tag,
  UserDto,
  TaskDto,
  NotificationDto,
  ChatMessageDto,
  ChatMessage,
  ChatConversationDto,
  ChatConversation,
  ChatAction,
  ChatActionType,
  SendMessageRequest,
  SendMessageResponse,
  GetConversationsResponse,
  GetMessagesResponse,
} from '@/types';
import {
  transformTagDtosToFrontendModels,
  transformTagDtoToFrontendModel,
  transformTaskDtoToFrontendModel,
  transformTaskDtosToFrontendModels,
  transformUserDtoToFrontendModel,
  transformUserDtosToFrontendModels,
  transformNotificationDtoToFrontendModel,
  transformNotificationDtosToFrontendModels,
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
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8003/api'; // Default to local backend
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
  console.log('Making API request to:', url, 'with options:', options);

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

  // Log the request body if it exists
  if (options.body) {
    console.log('Request body:', options.body);
  }

  // For local development, we need to ensure the cookie is sent even with different protocols
  if (process.env.NODE_ENV === 'development') {
    config.credentials = 'include';
  }

  try {
    let response = await fetch(url, config);
    console.log('Response received:', response.status, response.statusText);

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
        console.log('Error response body:', errorBody);
        console.log('Full error details:', { status: response.status, errorBody });
        if (errorBody.message) {
          errorMessage = errorBody.message;
        } else if (errorBody.detail) {
          errorMessage = errorBody.detail;
        } else if (errorBody.errors) {
          // Handle validation errors that might be in a different format
          console.log('Validation errors:', errorBody.errors);
          if (Array.isArray(errorBody.errors)) {
            errorMessage = errorBody.errors.map((err: any) => err.msg || err.detail || err).join('; ');
          } else {
            errorMessage = JSON.stringify(errorBody.errors);
          }
        }
      } catch (parseError) {
        // If we can't parse the error body, use the status code
        console.warn('Could not parse error response:', parseError);
        // Try to get text response if JSON parsing fails
        try {
          const errorText = await response.text();
          console.log('Error response as text:', errorText);
          errorMessage = errorText;
        } catch (textError) {
          console.warn('Could not parse error response as text either:', textError);
        }
      }

      throw new ApiError(errorMessage, response.status);
    }

    const result = await response.json();
    console.log('Successful response body:', result);
    return result;
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
    console.log('[tasksApi.getAll] Fetching from:', `/tasks${queryString ? '?' + queryString : ''}`);
    const response = await apiRequest<any>(`/tasks${queryString ? '?' + queryString : ''}`);
    console.log('[tasksApi.getAll] Raw API response:', response);
    console.log('[tasksApi.getAll] Is response an array?:', Array.isArray(response));

    // The backend returns an array directly, not an object with tasks property
    const tasksArray = Array.isArray(response) ? response : (response.tasks || []);
    console.log('[tasksApi.getAll] Tasks array to transform:', tasksArray.length);
    
    return {
      tasks: tasksArray.map(transformTaskDtoToFrontendModel),
      pagination: response.pagination || null
    };
  },

  getById: async (id: string) => {
    const response = await apiRequest<TaskDto>(`/tasks/${id}`);
    return transformTaskDtoToFrontendModel(response);
  },

  create: async (taskData: CreateTaskData & { userId?: string }) => {
    console.log('[API.create] Received data:', taskData);

    // Destructure userId separately to ensure it's included in the request
    const { userId, ...restTaskData } = taskData;

    // Build the payload with snake_case field names for backend compatibility
    const payload: any = {};

    // Convert dueDate to due_date for backend
    if (restTaskData.dueDate) {
      let dateStr = restTaskData.dueDate;
      const dateObj = new Date(dateStr);

      if (!isNaN(dateObj.getTime())) {
        // Convert to ISO string for backend
        payload.due_date = dateObj.toISOString();
        console.log('[API.create] Converted dueDate to due_date:', payload.due_date);
      } else {
        console.warn('Invalid dueDate provided, sending as-is:', restTaskData.dueDate);
        payload.due_date = restTaskData.dueDate;
      }
    }

    // Add other fields with snake_case conversion
    if (restTaskData.title) payload.title = restTaskData.title;
    if (restTaskData.description) payload.description = restTaskData.description;
    if (restTaskData.priority) payload.priority = restTaskData.priority;
    
    // Add recurrence_pattern_id if provided
    if ((restTaskData as any).recurrence_pattern_id) {
      payload.recurrence_pattern_id = (restTaskData as any).recurrence_pattern_id;
      console.log('[API.create] Including recurrence_pattern_id:', payload.recurrence_pattern_id);
    }

    // Add user_id for backend compatibility
    if (userId) {
      payload.user_id = userId;
    }

    // If tags are provided, convert to tag_ids for backend
    if (restTaskData.tags && Array.isArray(restTaskData.tags)) {
      payload.tag_ids = restTaskData.tags;
    }

    console.log('[API.create] Final payload being sent to backend:', payload);

    const response = await apiRequest<TaskDto>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    console.log('[API.create] Response from backend:', response);

    return transformTaskDtoToFrontendModel(response);
  },

  update: async (id: string, taskData: UpdateTaskData & { userId?: string }) => {
    console.log('[API.update] Received data for task ID:', id, 'data:', taskData);

    // Destructure userId separately to ensure it's included in the request if provided
    const { userId, ...restTaskData } = taskData;

    // Build the payload with snake_case field names for backend compatibility
    const payload: any = {};

    // Convert dueDate to due_date for backend
    if (restTaskData.dueDate) {
      let dateStr = restTaskData.dueDate;
      const dateObj = new Date(dateStr);

      if (!isNaN(dateObj.getTime())) {
        // Convert to ISO string for backend
        payload.due_date = dateObj.toISOString();
        console.log('[API.update] Converted dueDate to due_date:', payload.due_date);
      } else {
        console.warn('Invalid dueDate provided for update, sending as-is:', restTaskData.dueDate);
        payload.due_date = restTaskData.dueDate;
      }
    }

    // Add other fields with snake_case conversion
    if (restTaskData.title !== undefined) payload.title = restTaskData.title;
    if (restTaskData.description !== undefined) payload.description = restTaskData.description;
    if (restTaskData.priority !== undefined) payload.priority = restTaskData.priority;
    if (restTaskData.completed !== undefined) payload.status = restTaskData.completed ? 'completed' : 'pending';
    
    // Add recurrence_pattern_id if provided
    if ((restTaskData as any).recurrence_pattern_id !== undefined) {
      payload.recurrence_pattern_id = (restTaskData as any).recurrence_pattern_id;
      console.log('[API.update] Including recurrence_pattern_id:', payload.recurrence_pattern_id);
    }

    // Add user_id for backend compatibility (if provided)
    if (userId) {
      payload.user_id = userId;
    }

    // If tags are provided, convert to tag_ids for backend
    if (restTaskData.tags && Array.isArray(restTaskData.tags)) {
      payload.tag_ids = restTaskData.tags;
    }

    console.log('[API.update] Final payload for update being sent to backend:', payload);

    const response = await apiRequest<TaskDto>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    console.log('[API.update] Response from backend:', response);

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

// ============================================================================
// AI Task Assistant Chat API functions
// ============================================================================

/**
 * Transform ChatMessageDto to ChatMessage (snake_case to camelCase)
 */
const transformChatMessageDtoToFrontendModel = (dto: ChatMessageDto): ChatMessage => ({
  id: dto.id,
  conversationId: dto.conversation_id,
  role: dto.role,
  content: dto.content,
  timestamp: dto.timestamp,
  status: dto.status,
  actions: dto.actions?.map((action) => ({
    ...action,
    task_id: action.task_id,
    tag_id: action.tag_id,
  })),
  metadata: dto.metadata,
});

/**
 * Transform ChatMessage to ChatMessageDto (camelCase to snake_case)
 */
const transformChatMessageToBackendDto = (message: ChatMessage): ChatMessageDto => ({
  id: message.id,
  conversation_id: message.conversationId,
  role: message.role,
  content: message.content,
  timestamp: message.timestamp,
  status: message.status,
  actions: message.actions,
  metadata: message.metadata,
});

/**
 * Transform ChatConversationDto to ChatConversation (snake_case to camelCase)
 */
const transformChatConversationDtoToFrontendModel = (dto: ChatConversationDto): ChatConversation => ({
  id: dto.id,
  userId: dto.user_id,
  title: dto.title,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
  isActive: dto.is_active,
  messageCount: dto.message_count,
});

/**
 * Transform array of ChatConversationDto to ChatConversation
 */
const transformChatConversationDtosToFrontendModels = (dtos: ChatConversationDto[]): ChatConversation[] =>
  dtos.map(transformChatConversationDtoToFrontendModel);

/**
 * Transform backend action format to frontend ChatAction format
 * Backend returns: { type: 'tool_call', tool_name: 'create_task', arguments: {...}, result: {...} }
 * Frontend expects: { type: 'create_task', details: {...}, confirmed: true }
 */
const transformBackendActionToFrontend = (backendAction: any): ChatAction[] => {
  if (!backendAction) return [];

  // Handle both single action and array of actions
  const actions = Array.isArray(backendAction) ? backendAction : [backendAction];

  return actions
    .map((action: any): ChatAction | null => {
      // Map tool_name to action type
      const toolNameToType: Record<string, ChatActionType> = {
        create_task: 'create_task',
        update_task: 'update_task',
        delete_task: 'delete_task',
        mark_task_complete: 'complete_task',
        create_tag: 'create_tag',
        update_tag: 'update_tag',
        delete_tag: 'delete_tag',
        assign_tag: 'assign_tag',
        create_recurring_task: 'create_recurrence',
        cancel_recurrence: 'cancel_recurrence',
        schedule_reminder: 'schedule_reminder',
        get_tasks: 'query_tasks',
      };

      const actionType = action.tool_name
        ? toolNameToType[action.tool_name] || (action.intent_type as ChatActionType)
        : (action.intent_type as ChatActionType) || 'create_task';

      // Extract task/tag data from result or arguments
      const result = action.result || {};
      const argumentsData = action.arguments || {};

      // Build details object with camelCase conversion
      const details: Record<string, any> = {};

      // Extract task data
      if (result.task) {
        details.task = result.task;
        // Add task fields to details for easier access
        if (result.task.title) details.title = result.task.title;
        if (result.task.description) details.description = result.task.description;
        if (result.task.due_date) details.due_date = result.task.due_date;
        if (result.task.priority) details.priority = result.task.priority;
        if (result.task.status) details.status = result.task.status;
        if (result.task.tags) details.tags = result.task.tags;
      }

      // Extract tag data
      if (result.tag) {
        details.tag = result.tag;
        if (result.tag.name) details.name = result.tag.name;
        if (result.tag.color) details.color = result.tag.color;
      }

      // Merge arguments into details
      Object.assign(details, argumentsData);

      // Since backend has already executed the action, mark as confirmed
      // The action has been performed, we're just updating the UI
      return {
        type: actionType,
        task_id: result.task?.id || result.id || action.task_id,
        tag_id: result.tag?.id || result.id || action.tag_id,
        details,
        confirmed: true, // Backend already executed the action
      };
    })
    .filter((action): action is ChatAction => action !== null);
};

/**
 * Transform backend response actions to frontend format
 * Handles both single action and array of actions
 */
const transformBackendActionsToFrontend = (backendActions: any): ChatAction[] => {
  if (!backendActions) return [];

  // Backend may return:
  // 1. Single action object: { type, tool_name, result, ... }
  // 2. Array of actions: [{...}, {...}]
  // 3. Action wrapped in object: { action: {...} }

  if (backendActions.action) {
    // Wrapped in object
    return transformBackendActionToFrontend(backendActions.action);
  }

  if (Array.isArray(backendActions)) {
    // Array of actions - flatten all results
    return backendActions.flatMap((action: any) => transformBackendActionToFrontend(action));
  }

  // Single action object
  return transformBackendActionToFrontend(backendActions);
};

export interface CreateConversationRequest {
  title: string;
}

export interface UpdateConversationRequest {
  title: string;
}

export const chatApi = {
  /**
   * Send a message to the AI assistant
   */
  sendMessage: async (request: SendMessageRequest): Promise<SendMessageResponse> => {
    console.log('[chatApi.sendMessage] Sending message:', request);
    const response: any = await apiRequest<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: request.conversation_id,
        message: request.content,  // Changed from 'content' to 'message'
      }),
    });
    console.log('[chatApi.sendMessage] Response:', response);

    // Transform response to frontend models
    const transformedResponse: SendMessageResponse = {
      message: transformChatMessageDtoToFrontendModel(response.message),
      // Transform backend actions to frontend format
      // Backend returns: { action: {...} } or { actions: [...] }
      actions: transformBackendActionsToFrontend(response.action || response.actions),
    };

    if (response.conversation) {
      transformedResponse.conversation = transformChatConversationDtoToFrontendModel(response.conversation);
    }

    return transformedResponse;
  },

  /**
   * Get all conversations for the current user
   */
  getConversations: async (): Promise<ChatConversation[]> => {
    console.log('[chatApi.getConversations] Fetching conversations...');
    const response: { conversations: ChatConversationDto[] } = await apiRequest<{ conversations: ChatConversationDto[] }>('/chat/conversations');
    console.log('[chatApi.getConversations] Response:', response);
    return transformChatConversationDtosToFrontendModels(response.conversations);
  },

  /**
   * Get messages for a specific conversation
   */
  getMessages: async (conversationId: string): Promise<GetMessagesResponse> => {
    console.log('[chatApi.getMessages] Fetching messages for conversation:', conversationId);
    const response: any = await apiRequest<GetMessagesResponse>(`/chat/conversations/${conversationId}`);
    console.log('[chatApi.getMessages] Response:', response);

    return {
      messages: response.messages.map(transformChatMessageDtoToFrontendModel),
      conversation: response.conversation
        ? transformChatConversationDtoToFrontendModel(response.conversation)
        : undefined,
    };
  },

  /**
   * Create a new conversation
   */
  createConversation: async (title: string): Promise<ChatConversation> => {
    console.log('[chatApi.createConversation] Creating conversation:', title);
    const response: ChatConversationDto = await apiRequest<ChatConversationDto>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    console.log('[chatApi.createConversation] Response:', response);
    return transformChatConversationDtoToFrontendModel(response);
  },

  /**
   * Update a conversation title
   */
  updateConversation: async (conversationId: string, title: string): Promise<ChatConversation> => {
    console.log('[chatApi.updateConversation] Updating conversation:', conversationId, 'title:', title);
    const response: ChatConversationDto = await apiRequest<ChatConversationDto>(
      `/chat/conversations/${conversationId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ title }),
      }
    );
    console.log('[chatApi.updateConversation] Response:', response);
    return transformChatConversationDtoToFrontendModel(response);
  },

  /**
   * Delete a conversation (soft delete)
   */
  deleteConversation: async (conversationId: string): Promise<void> => {
    console.log('[chatApi.deleteConversation] Deleting conversation:', conversationId);
    await apiRequest(`/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  },
};