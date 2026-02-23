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
  status: string; // Backend field: 'pending', 'completed', 'in_progress'
  completed?: boolean; // Frontend field (derived from status)
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  completed_at: string | null;
  user_id: string;
  tags?: string[]; // Array of tag IDs associated with the task
  recurrence_pattern_id?: string | null; // Recurrence pattern ID for recurring tasks
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
  status?: 'pending' | 'in_progress' | 'completed'; // Backend status field
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completedAt?: string;
  tags: string[]; // Array of tag IDs associated with the task
  userId: string;
  recurrence_pattern_id?: string | null; // Recurrence pattern ID for recurring tasks
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
    search?: string;
    sortBy?: 'title' | 'priority' | 'dueDate' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
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

// ============================================================================
// AI Task Assistant Chat Types
// ============================================================================

// Chat message role types
export type ChatMessageRole = 'user' | 'assistant' | 'system';

// Chat message status types
export type ChatMessageStatus = 'sending' | 'sent' | 'delivered' | 'failed';

// Chat action types for task operations
export type ChatActionType = 
  | 'create_task'
  | 'update_task'
  | 'delete_task'
  | 'complete_task'
  | 'create_tag'
  | 'update_tag'
  | 'delete_tag'
  | 'assign_tag'
  | 'create_recurrence'
  | 'update_recurrence'
  | 'cancel_recurrence'
  | 'schedule_reminder'
  | 'query_tasks';

// Chat action interface - represents actions extracted from chat messages
export interface ChatAction {
  type: ChatActionType;
  task_id?: string;
  tag_id?: string;
  details?: Record<string, any>;
  confirmed?: boolean;
}

// Chat message interface - DTO format (snake_case for backend compatibility)
export interface ChatMessageDto {
  id: string;
  conversation_id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: string;
  status?: ChatMessageStatus;
  actions?: ChatAction[];
  metadata?: Record<string, any>;
}

// Chat message interface - Frontend model (camelCase)
export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatMessageRole;
  content: string;
  timestamp: string;
  status?: ChatMessageStatus;
  actions?: ChatAction[];
  metadata?: Record<string, any>;
}

// Chat conversation interface - DTO format
export interface ChatConversationDto {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  message_count?: number;
}

// Chat conversation interface - Frontend model
export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  messageCount?: number;
}

// Chat state interface for Redux store
export interface ChatState {
  messages: ChatMessage[];
  conversations: ChatConversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  typingIndicator: boolean;
  // Cross-slice state for auto-updates from agent actions
  tasks?: any[];  // Task[] - lazy loaded to avoid circular dependencies
  tags?: any[];   // Tag[] - lazy loaded to avoid circular dependencies
}

// Chat API request/response types
export interface SendMessageRequest {
  conversation_id?: string;
  content: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  conversation?: ChatConversation;
  actions?: ChatAction[];
}

export interface GetConversationsResponse {
  conversations: ChatConversationDto[];
}

export interface GetMessagesResponse {
  messages: ChatMessage[];
  conversation?: ChatConversation;
}

// Chat configuration types
export interface ChatConfig {
  maxHistoryLength: number;
  typingIndicatorDelay: number;
  retryAttempts: number;
}

// ============================================================================
// Additional Chat-Related Types (US4 - Task Queries)
// ============================================================================

// Task query result types
export interface TaskQueryResult {
  tasks: Array<{
    id: string;
    title: string;
    description?: string | null;
    due_date?: string | null;
    priority?: 'low' | 'medium' | 'high';
    status?: 'pending' | 'in_progress' | 'completed';
    tags?: string[];
  }>;
  count: number;
  query_type?: 'time_based' | 'priority' | 'tag' | 'status' | 'general';
  summary?: string;
}

// Task match for disambiguation
export interface TaskMatch {
  id: string;
  title: string;
  due_date?: string | null;
  priority?: string;
  status?: string;
  match_score?: number;
}

// Clarification request from agent
export interface ClarificationRequest {
  questions: string[];
  options?: Array<{
    label: string;
    value: string;
  }>;
  context?: Record<string, any>;
}

// Chat message metadata for disambiguation
export interface ChatMessageMetadata {
  task_matches?: TaskMatch[];
  task_reference?: string;
  clarification_needed?: boolean;
  clarification_request?: ClarificationRequest;
  query_result?: TaskQueryResult;
  [key: string]: any;
}

// ============================================================================
// Recurrence Types
// ============================================================================

// Recurrence pattern types
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurrenceEndCondition = 'never' | 'after' | 'on_date';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface RecurrencePattern {
  id?: string;
  frequency: RecurrenceFrequency;
  interval: number;
  days_of_week?: DayOfWeek[];
  day_of_month?: number;
  end_condition: RecurrenceEndCondition;
  end_after_occurrences?: number;
  end_date?: string;
  time?: string;
}

export interface RecurrencePatternDto {
  id: string;
  frequency: RecurrenceFrequency;
  interval: number;
  days_of_week?: DayOfWeek[];
  day_of_month?: number;
  end_condition: RecurrenceEndCondition;
  end_after_occurrences?: number;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Reminder Types
// ============================================================================

export type ReminderDeliveryMethod = 'browser' | 'email' | 'push';

export interface Reminder {
  id: string;
  task_id: string;
  reminder_time: string;
  delivery_method: ReminderDeliveryMethod;
  message: string;
  is_triggered: boolean;
  triggered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderDto {
  id: string;
  task_id: string;
  reminder_time: string;
  delivery_method: ReminderDeliveryMethod;
  message: string;
  is_triggered: boolean;
  triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Conversation Management Types
// ============================================================================

// Conversation list response
export interface ConversationListResponse {
  success: boolean;
  conversations: ChatConversationDto[];
  total: number;
  limit: number;
  offset: number;
}

// Conversation search response
export interface ConversationSearchResponse {
  success: boolean;
  conversations: ChatConversationDto[];
  total: number;
}

// Conversation delete response
export interface ConversationDeleteResponse {
  success: boolean;
  message: string;
}

// Bulk conversation delete response
export interface BulkConversationDeleteResponse {
  success: boolean;
  deleted_count: number;
  message: string;
}

// ============================================================================
// API Utility Types
// ============================================================================

// Paginated response wrapper
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Error response structure
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Loading state type for async operations
export interface LoadingState {
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
}