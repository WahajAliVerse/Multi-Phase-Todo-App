// API service for interacting with the backend
import { API_BASE_URL } from '@/constants';

// Define the base API client
class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  }

  // Set the authentication token
  setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth-token', token);
    } else {
      localStorage.removeItem('auth-token');
    }
  }

  // Remove the authentication token
  removeAuthToken() {
    this.token = null;
    localStorage.removeItem('auth-token');
  }

  // Generic request method with error handling and retry mechanism
  async request(endpoint: string, options: RequestInit = {}, retries = 3) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    let lastError;
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, config);
        
        // If response is not OK, throw an error
        if (!response.ok) {
          // If it's an unauthorized error, remove the token and redirect to login
          if (response.status === 401) {
            this.removeAuthToken();
            // Optionally redirect to login page
            // window.location.href = '/login';
            throw new Error('Unauthorized. Please log in again.');
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // For DELETE requests, return early without parsing JSON
        if (response.status === 204) {
          return null;
        }
        
        return await response.json();
      } catch (error) {
        lastError = error;
        // If this is the last attempt, throw the error
        if (i === retries) {
          console.error(`API request failed after ${retries + 1} attempts: ${url}`, error);
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    // This line should never be reached, but TypeScript requires a return
    throw lastError;
  }

  // GET request
  get(endpoint: string, retries = 3) {
    return this.request(endpoint, { method: 'GET' }, retries);
  }

  // POST request
  post(endpoint: string, data: any, retries = 3) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, retries);
  }

  // PUT request
  put(endpoint: string, data: any, retries = 3) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, retries);
  }

  // DELETE request
  delete(endpoint: string, retries = 3) {
    return this.request(endpoint, { method: 'DELETE' }, retries);
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export individual API functions
export const taskApi = {
  getAll: (retries = 3) => apiClient.get('/tasks', retries),
  getById: (id: string, retries = 3) => apiClient.get(`/tasks/${id}`, retries),
  create: (task: any, retries = 3) => apiClient.post('/tasks', task, retries),
  update: (id: string, task: any, retries = 3) => apiClient.put(`/tasks/${id}`, task, retries),
  delete: (id: string, retries = 3) => apiClient.delete(`/tasks/${id}`, retries),
  toggleComplete: (id: string, retries = 3) => apiClient.put(`/tasks/${id}/toggle-complete`, {}, retries),
};

export const authApi = {
  login: (credentials: { email: string; password: string }, retries = 3) => 
    apiClient.post('/auth/login', credentials, retries),
  register: (userData: { email: string; password: string; username: string }, retries = 3) => 
    apiClient.post('/auth/register', userData, retries),
  logout: () => {
    apiClient.removeAuthToken();
  },
  getCurrentUser: (retries = 3) => apiClient.get('/auth/me', retries),
};

export const userApi = {
  getProfile: (retries = 3) => apiClient.get('/users/profile', retries),
  updateProfile: (profileData: any, retries = 3) => apiClient.put('/users/profile', profileData, retries),
};

export const tagApi = {
  getAll: (retries = 3) => apiClient.get('/tags', retries),
  create: (tag: any, retries = 3) => apiClient.post('/tags', tag, retries),
  update: (id: string, tag: any, retries = 3) => apiClient.put(`/tags/${id}`, tag, retries),
  delete: (id: string, retries = 3) => apiClient.delete(`/tags/${id}`, retries),
};