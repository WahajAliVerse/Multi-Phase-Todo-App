// API service with automatic token management
import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
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

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If token has expired, log out the user
    if (error.response && error.response.status === 401) {
      // Remove the token from localStorage
      localStorage.removeItem('access_token');
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export the API client
export default apiClient;

// Export individual API functions
export const taskApi = {
  getAll: (params?: Record<string, string | number>) => {
    const queryParams = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    const url = queryParams ? `/tasks?${queryParams}` : '/tasks';
    return apiClient.get(url);
  },
  getById: (id: string) => apiClient.get(`/tasks/${id}`),
  create: (task: any) => apiClient.post('/tasks', task),
  update: (id: string, task: any) => apiClient.put(`/tasks/${id}`, task),
  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
  toggleComplete: (id: string) => apiClient.patch(`/tasks/${id}/toggle-status`),
};

export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  register: (userData: { username: string; email: string; password: string }) =>
    apiClient.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return Promise.resolve({ data: { message: 'Logged out successfully' } });
  },
  getCurrentUser: () => apiClient.get('/users/me'),
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', {}, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    }),
};

export const userApi = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (profileData: any) => apiClient.put('/users/profile', profileData),
  getCurrentUser: () => apiClient.get('/users/me'),
};

export const tagApi = {
  getAll: () => apiClient.get('/tags'),
  getById: (id: string) => apiClient.get(`/tags/${id}`),
  create: (tag: any) => apiClient.post('/tags', tag),
  update: (id: string, tag: any) => apiClient.put(`/tags/${id}`, tag),
  delete: (id: string) => apiClient.delete(`/tags/${id}`),
};

export const themeApi = {
  getPreferences: () => apiClient.get('/user/preferences/theme'),
  updatePreferences: (preferences: any) => apiClient.put('/user/preferences/theme', preferences),
};