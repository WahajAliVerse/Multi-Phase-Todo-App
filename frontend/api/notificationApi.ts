import axios from 'axios';
import { Notification } from '@/lib/types';

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

// Notification API functions
export const notificationApi = {
  // Get all notifications for the current user
  getNotifications: async (params?: { 
    skip?: number; 
    limit?: number; 
    status?: string; 
    type?: string; 
    unread_only?: boolean 
  }): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications/', { params });
    return response.data;
  },

  // Get pending notifications for the current user
  getPendingNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications/pending');
    return response.data;
  },

  // Get a specific notification by ID
  getNotificationById: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // Create a new notification
  createNotification: async (notificationData: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<Notification> => {
    const response = await apiClient.post('/notifications/', notificationData);
    return response.data;
  },

  // Update a notification
  updateNotification: async (notificationId: string, notificationData: Partial<Notification>): Promise<Notification> => {
    const response = await apiClient.put(`/notifications/${notificationId}`, notificationData);
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Get notification settings
  getNotificationSettings: async (): Promise<any> => {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  },

  // Update notification settings
  updateNotificationSettings: async (settings: any): Promise<any> => {
    const response = await apiClient.post('/notifications/settings', settings);
    return response.data;
  },
};