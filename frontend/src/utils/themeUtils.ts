// Utility functions for theme management

// Function to detect system theme preference
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light'; // Default to light for SSR
};

// Function to save theme preference to localStorage
export const saveThemePreference = (theme: 'light' | 'dark'): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-preference', theme);
  }
};

// Function to get saved theme preference from localStorage
export const getSavedThemePreference = (): 'light' | 'dark' | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme-preference') as 'light' | 'dark' | null;
  }
  return null;
};

// Function to apply theme to the document
export const applyTheme = (theme: 'light' | 'dark'): void => {
  if (typeof document !== 'undefined') {
    // Remove existing theme classes
    document.documentElement.classList.remove('light', 'dark');
    
    // Add the new theme class
    document.documentElement.classList.add(theme);
    
    // Also set the data-theme attribute if used by any CSS
    document.documentElement.setAttribute('data-theme', theme);
  }
};

// Function to initialize theme based on preference
export const initializeTheme = (): 'light' | 'dark' => {
  const savedTheme = getSavedThemePreference();
  const systemTheme = getSystemTheme();
  
  return savedTheme || systemTheme;
};