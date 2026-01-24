import { useState, useEffect } from 'react';

// Hook for managing persistent state for critical user data
export const usePersistentState = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading persistent state key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting persistent state key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

// Specific hook for user preferences that need to persist
export const useUserPreferences = () => {
  return usePersistentState('user-preferences', {
    theme: 'light' as 'light' | 'dark',
    language: 'en',
    notificationsEnabled: true,
    lastUpdated: new Date().toISOString(),
  });
};

// Specific hook for application settings that need to persist
export const useAppSettings = () => {
  return usePersistentState('app-settings', {
    animationsEnabled: true,
    reducedMotion: false,
    autoSave: true,
    lastSync: new Date().toISOString(),
  });
};