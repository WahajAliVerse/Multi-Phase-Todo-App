// Authentication service for handling user authentication
import { authApi } from './api';
import { store } from '@/store';
import { login, register, logout, checkAuthStatus } from '@/store/slices/authSlice';
import { setUserProfile, clearUserProfile } from '@/store/slices/userSlice';

// Define the authentication service
class AuthService {
  // Login method
  async login(credentials: { email: string; password: string }) {
    try {
      const result = await store.dispatch(login(credentials)).unwrap();

      return { success: true, user: result.user, token: result.token };
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  }

  // Register method
  async register(userData: { username: string; email: string; password: string }) {
    try {
      const result = await store.dispatch(register(userData)).unwrap();

      return { success: true, user: result.user, token: result.token };
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  }

  // Logout method
  logout() {
    store.dispatch(logout());
    store.dispatch(clearUserProfile());
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
      // We'll dispatch the checkAuthStatus action to verify the current user
      const result = await store.dispatch(checkAuthStatus()).unwrap();
      return result.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.logout(); // If getting user fails, logout
      return null;
    }
  }

  // Clear auth error
  clearAuthError() {
    // The clearAuthError is handled in the slice itself
    // No need to dispatch anything here as we're just clearing the error state
  }
}

// Export a singleton instance
export const authService = new AuthService();

export default authService;