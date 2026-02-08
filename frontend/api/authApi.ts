import axios from 'axios';
import { User, UserCreate, UserUpdate } from '@/lib/types';
import { tokenApi } from './tokenApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Enable sending cookies with requests
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

// Track if a token refresh is in progress to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, add the request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await tokenApi.refreshToken();
        const newToken = response.access_token;

        // Update the token in localStorage
        localStorage.setItem('access_token', newToken);

        // Update the authorization header for the original request
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;

        // Process the queue with the new token
        processQueue(null, newToken);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear the token and redirect to login
        localStorage.removeItem('access_token');
        
        // Process the queue with the error
        processQueue(refreshError, null);
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  // Register a new user
  register: async (userData: UserCreate): Promise<{ user: User; access_token: string }> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (email: string, password: string): Promise<{ access_token: string; token_type: string }> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    // Token removal is handled by the response interceptor
  },

  // Get current user profile
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<UserUpdate>): Promise<User> => {
    const response = await apiClient.put('/auth/me', userData);
    return response.data;
  },

  // Refresh access token - this will be handled by the interceptor
  refreshToken: async (): Promise<{ access_token: string }> => {
    // This function is now handled by the tokenApi
    return tokenApi.refreshToken();
  },
};

// Export the apiClient so other modules can use the same instance with interceptors
export { apiClient };