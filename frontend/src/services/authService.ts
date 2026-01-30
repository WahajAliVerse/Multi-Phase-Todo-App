import { api } from './api';

interface User {
  id: string;
  username: string;
  email: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notificationSettings?: any;
  };
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
}

interface RegisterResponse {
  message: string;
  user_id: string;
}

/**
 * Service for handling authentication operations
 */
export const authService = {
  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/v1/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post('/v1/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await api.post('/v1/auth/logout');
      return response.data;
    } catch (error: any) {
      // Even if the logout request fails, we should still clear local state
      console.error('Logout error:', error);
      return { message: 'Logged out' };
    }
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/v1/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get user info');
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ message: string }> {
    try {
      const response = await api.post('/v1/auth/refresh');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to refresh token');
    }
  }
};