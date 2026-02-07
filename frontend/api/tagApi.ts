import axios from 'axios';
import { Tag } from '@/lib/types';

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

// Tag API functions
export const tagApi = {
  // Get all tags for the current user
  getTags: async (params?: { skip?: number; limit?: number }): Promise<Tag[]> => {
    const response = await apiClient.get('/tags/', { params });
    return response.data;
  },

  // Get a specific tag by ID
  getTagById: async (tagId: string): Promise<Tag> => {
    const response = await apiClient.get(`/tags/${tagId}`);
    return response.data;
  },

  // Create a new tag
  createTag: async (tagData: Omit<Tag, 'id' | 'created_at' | 'updated_at'>): Promise<Tag> => {
    const response = await apiClient.post('/tags/', tagData);
    return response.data;
  },

  // Update a tag
  updateTag: async (tagId: string, tagData: Partial<Omit<Tag, 'id' | 'created_at' | 'updated_at'>>): Promise<Tag> => {
    const response = await apiClient.put(`/tags/${tagId}`, tagData);
    return response.data;
  },

  // Delete a tag
  deleteTag: async (tagId: string): Promise<void> => {
    await apiClient.delete(`/tags/${tagId}`);
  },
};