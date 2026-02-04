import axiosInstance from '@/utils/http/axiosConfig';
import { User } from '@/lib/types';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface UpdateProfileData extends Partial<User> {}

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<{ user: User }> => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData: RegisterData): Promise<{ user: User }> => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<{ success: boolean }> => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ user: User }> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: UpdateProfileData): Promise<{ user: User }> => {
    const response = await axiosInstance.put('/auth/profile', profileData);
    return response.data;
  },
};