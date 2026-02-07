import axios from 'axios';
import { Task, TaskFormData, PaginationParams, FilterParams } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, clear it and redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Task API functions
export const taskApi = {
  // Get all tasks with optional filters and pagination
  getTasks: async (params?: PaginationParams & FilterParams): Promise<{ tasks: Task[]; total: number }> => {
    const response = await apiClient.get('/tasks/', { params });
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