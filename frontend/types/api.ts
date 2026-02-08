export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  tag_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  tag_ids?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  tag_ids?: string[];
}

export interface CreateTagRequest {
  name: string;
  color: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}