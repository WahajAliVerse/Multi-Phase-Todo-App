import { apiClient } from './authApi';
import { Task, TaskFormData, PaginationParams, FilterParams } from '@/lib/types';

// Task API functions
export const taskApi = {
  // Get all tasks with optional filters and pagination
  getTasks: async (params?: PaginationParams & FilterParams): Promise<{ items: Task[]; total: number; offset: number; limit: number }> => {
    const response = await apiClient.get('/tasks/', { params });
    // Ensure the response follows the expected format with items, total, offset, and limit
    if (response.data && Array.isArray(response.data)) {
      // If the response is just an array, wrap it in the expected format
      return {
        items: response.data,
        total: response.data.length,
        offset: params?.skip || 0,
        limit: params?.limit || response.data.length
      };
    }
    // Otherwise, return the response as is (assuming it's already in the correct format)
    return response.data;
  },

  // Get a specific task by ID
  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Create a new task
  createTask: async (taskData: TaskFormData): Promise<Task> => {
    const response = await apiClient.post('/tasks/', taskData);
    return response.data;
  },

  // Update a task
  updateTask: async (taskId: string, taskData: TaskFormData): Promise<Task> => {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete a task
  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  // Mark a task as complete
  markTaskComplete: async (taskId: string): Promise<Task> => {
    const response = await apiClient.patch(`/tasks/${taskId}/complete`);
    return response.data;
  },

  // Mark a task as incomplete
  markTaskIncomplete: async (taskId: string): Promise<Task> => {
    const response = await apiClient.patch(`/tasks/${taskId}/incomplete`);
    return response.data;
  },
};