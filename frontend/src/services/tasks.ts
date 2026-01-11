import api from './api';
import { Task } from '../types';

export const taskService = {
  async getAllTasks(params?: {
    status?: string;
    priority?: string;
    search?: string;
    sort?: string;
    order?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tasks: Task[]; total: number }> {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch tasks');
    }
  },

  async getTaskById(id: string): Promise<Task> {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch task');
    }
  },

  async createTask(taskData: Partial<Task>): Promise<Task> {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create task');
    }
  },

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update task');
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete task');
    }
  },

  async markTaskComplete(id: string): Promise<Task> {
    try {
      const response = await api.post(`/tasks/${id}/complete`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to mark task complete');
    }
  },

  async reopenTask(id: string): Promise<Task> {
    try {
      const response = await api.post(`/tasks/${id}/reopen`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to reopen task');
    }
  },
};