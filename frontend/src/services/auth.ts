// Authentication service for handling user authentication
import { authApi, userApi } from './api';

// Define the authentication service
class AuthService {
  // Login method
  async login(credentials: { username: string; password: string }) {
    try {
      const response = await authApi.login(credentials);
      const { access_token, refresh_token } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      return { success: true, user: response.data.user, token: access_token };
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  }

  // Register method
  async register(userData: { username: string; email: string; password: string }) {
    try {
      const response = await authApi.register(userData);
      const { access_token, refresh_token } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      return { success: true, user: response.data.user, token: access_token };
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  }

  // Logout method
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    // Check if token exists in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return !!token;
  }

  // Get current user
  async getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const response = await userApi.getCurrentUser();
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.logout(); // If getting user fails, logout
      return null;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();

export default authService;