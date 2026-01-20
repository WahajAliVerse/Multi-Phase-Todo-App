// services/authService.ts

// Define the authentication service
class AuthService {
  private token: string | null = null;
  
  constructor() {
    // Check if token exists in localStorage on initialization
    this.token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  }

  // Login method
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store the token in localStorage
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        this.token = data.access_token;
      }
      
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  // Register method
  async register(userData: { username: string; email: string; password: string }) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      
      // Store the token in localStorage
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        this.token = data.access_token;
      }
      
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  // Logout method
  logout() {
    localStorage.removeItem('access_token');
    this.token = null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get the current token
  getToken(): string | null {
    return this.token;
  }

  // Get user profile
  async getProfile() {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, logout the user
          this.logout();
        }
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();

export default authService;