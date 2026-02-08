import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Create a separate axios instance for token operations to avoid circular dependency
const tokenApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Enable sending cookies with requests
});

export const tokenApi = {
  // Refresh access token
  refreshToken: async (): Promise<{ access_token: string }> => {
    try {
      // Check if backend has a refresh endpoint
      const response = await tokenApiClient.post('/auth/refresh');
      return response.data;
    } catch (error: any) {
      // If refresh endpoint doesn't exist or fails, we may need to handle it differently
      // For now, we'll just re-throw the error which will trigger the logout flow
      if (error.response?.status === 404 || error.response?.status === 405) {
        // If refresh endpoint doesn't exist, we can't refresh the token
        // In a real implementation, you'd want a proper refresh token system
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
      
      // If it's another type of error, re-throw it
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      throw error;
    }
  },
};