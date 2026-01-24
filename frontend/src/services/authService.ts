// services/authService.ts
import apiClient, { authApi } from './api';

// Define the authentication service
class AuthService {
  // Login method
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await authApi.login(credentials);

      // Store the token in localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Login failed');
    }
  }

  // Register method
  async register(userData: { username: string; email: string; password: string }) {
    try {
      const response = await authApi.register(userData);

      // Store the token in localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Registration failed');
    }
  }

  // Logout method
  logout() {
    authApi.logout();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Get the current token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token might be expired, logout the user
        this.logout();
      }
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();

export default authService;