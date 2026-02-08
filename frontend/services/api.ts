import { 
  Task, 
  Tag, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  CreateTagRequest, 
  UpdateTagRequest,
  ApiError 
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Don't throw on HTTP error status codes - we'll handle them in the response
      const data = await response.json();
      
      if (!response.ok) {
        // Return error object instead of throwing
        return { error: data } as T;
      }
      
      return data;
    } catch (error) {
      // Handle network errors
      console.error(`API request failed: ${url}`, error);
      return { error: { detail: 'Network error. Please check your connection.' } } as T;
    }
  }

  // Task API methods
  async getTasks(): Promise<{ data?: Task[]; error?: ApiError }> {
    return this.request<Task[]>('/tasks/');
  }

  async getTask(id: string): Promise<{ data?: Task; error?: ApiError }> {
    return this.request<Task>(`/tasks/${id}/`);
  }

  async createTask(taskData: CreateTaskRequest): Promise<{ data?: Task; error?: ApiError }> {
    return this.request<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, taskData: UpdateTaskRequest): Promise<{ data?: Task; error?: ApiError }> {
    return this.request<Task>(`/tasks/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: string): Promise<{ error?: ApiError }> {
    return this.request<{}>(`/tasks/${id}/`, {
      method: 'DELETE',
    });
  }

  // Tag API methods
  async getTags(): Promise<{ data?: Tag[]; error?: ApiError }> {
    return this.request<Tag[]>('/tags/');
  }

  async getTag(id: string): Promise<{ data?: Tag; error?: ApiError }> {
    return this.request<Tag>(`/tags/${id}/`);
  }

  async createTag(tagData: CreateTagRequest): Promise<{ data?: Tag; error?: ApiError }> {
    return this.request<Tag>('/tags/', {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  }

  async updateTag(id: string, tagData: UpdateTagRequest): Promise<{ data?: Tag; error?: ApiError }> {
    return this.request<Tag>(`/tags/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(tagData),
    });
  }

  async deleteTag(id: string): Promise<{ error?: ApiError }> {
    return this.request<{}>(`/tags/${id}/`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();