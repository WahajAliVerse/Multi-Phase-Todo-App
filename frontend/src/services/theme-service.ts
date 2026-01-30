// Service for managing theme preferences with backend API
import { UserPreferences } from '../services/local-storage';
import { api } from './api';

/**
 * Fetch user's theme preferences from the backend
 */
export const fetchThemePreferences = async (): Promise<UserPreferences | null> => {
  try {
    const response = await api.get('/user/preferences');

    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch theme preferences:', error);
    // Handle 401 errors by clearing the token
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
    }
    return null;
  }
};

/**
 * Save user's theme preferences to the backend
 */
export const saveThemePreferences = async (preferences: Partial<UserPreferences>): Promise<boolean> => {
  try {
    const response = await api.put('/user/preferences', preferences);

    return response.status === 200;
  } catch (error: any) {
    console.error('Failed to save theme preferences:', error);
    // Handle 401 errors by clearing the token
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
    }
    return false;
  }
};