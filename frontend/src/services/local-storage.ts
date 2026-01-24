// Service for managing user preferences in localStorage
export interface UserPreferences {
  themePreference: 'light' | 'dark' | 'system';
  animationPreference: 'enabled' | 'reduced';
  language: string;
  lastUpdated: string;
}

const PREFERENCES_KEY = 'user-preferences';

/**
 * Get user preferences from localStorage
 */
export const getUserPreferences = (): UserPreferences | null => {
  try {
    const prefsStr = localStorage.getItem(PREFERENCES_KEY);
    if (!prefsStr) {
      return null;
    }
    
    const prefs: UserPreferences = JSON.parse(prefsStr);
    return prefs;
  } catch (error) {
    console.error('Failed to get user preferences:', error);
    return null;
  }
};

/**
 * Save user preferences to localStorage
 */
export const setUserPreferences = (preferences: Partial<UserPreferences>): void => {
  try {
    const existingPrefs = getUserPreferences() || {
      themePreference: 'system',
      animationPreference: 'enabled',
      language: 'en',
      lastUpdated: new Date().toISOString()
    };
    
    const updatedPrefs: UserPreferences = {
      ...existingPrefs,
      ...preferences,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPrefs));
  } catch (error) {
    console.error('Failed to save user preferences:', error);
  }
};

/**
 * Clear user preferences from localStorage
 */
export const clearUserPreferences = (): void => {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error('Failed to clear user preferences:', error);
  }
};