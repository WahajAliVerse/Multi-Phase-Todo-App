import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Retrieve token from wherever it's stored (localStorage, redux store, etc.)
    const token = localStorage.getItem('authToken'); // Adjust based on your storage method
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add credentials for handling HTTP-only cookies
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle global error responses (e.g., 401 Unauthorized, 403 Forbidden)
    if (error.response?.status === 401) {
      // Token might be expired, redirect to login
      localStorage.removeItem('authToken'); // Clear invalid token
      window.location.href = '/login'; // Redirect to login page
    } else if (error.response?.status === 403) {
      // Handle forbidden access
      console.error('Access forbidden:', error.response.data);
    } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      // Handle network errors or timeouts
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;