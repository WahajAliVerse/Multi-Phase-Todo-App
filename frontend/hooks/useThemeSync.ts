'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateUserProfile } from '@/redux/slices/authSlice';
import { User } from '@/types';

/**
 * Custom hook to synchronize theme preference between local state and backend
 */
export const useThemeSync = () => {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  // Ref to track if theme has been initialized from user profile
  const themeInitializedRef = useRef(false);
  // Ref to track the previous theme to prevent unnecessary updates
  const prevThemeRef = useRef(theme);

  useEffect(() => {
    // Load theme preference from user profile when authenticated
    if (isAuthenticated && user && !themeInitializedRef.current) {
      // Set the theme based on user's saved preference
      if (user.preferences?.theme) {
        setTheme(user.preferences.theme);
        themeInitializedRef.current = true;
      } else {
        // If no theme preference is set, ensure we save the default to backend
        const defaultTheme = theme || 'light';
        setTheme(defaultTheme);
        themeInitializedRef.current = true;
      }
    }
  }, [isAuthenticated, user, setTheme, theme]);

  // Memoize the update function to prevent unnecessary re-renders
  const updateThemeOnBackend = useCallback(async (newTheme: string) => {
    if (isAuthenticated && user && newTheme && newTheme !== user.preferences?.theme) {
      try {
        // Update user profile with new theme preference
        await dispatch(updateUserProfile({
          preferences: {
            ...user.preferences,
            theme: newTheme
          }
        })).unwrap();
      } catch (error) {
        console.error('Failed to sync theme preference to backend:', error);
      }
    }
  }, [isAuthenticated, user, dispatch]);

  // Effect to sync theme changes to backend when user is authenticated
  useEffect(() => {
    // Only sync if:
    // 1. User is authenticated
    // 2. User exists
    // 3. Theme is defined
    // 4. Theme has changed from the previous value
    // 5. Theme initialization is complete
    if (isAuthenticated && user && theme && theme !== prevThemeRef.current && themeInitializedRef.current) {
      // Debounce the update to avoid excessive API calls
      const timer = setTimeout(() => {
        updateThemeOnBackend(theme);
        // Update the previous theme ref after the update
        prevThemeRef.current = theme;
      }, 500); // Increased delay to reduce API calls

      return () => clearTimeout(timer);
    } else if (theme) {
      // Update the previous theme ref if the theme has changed but we're not syncing
      prevThemeRef.current = theme;
    }
  }, [theme, isAuthenticated, user, updateThemeOnBackend]);

  /**
   * Toggle theme and sync with backend
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return {
    theme,
    toggleTheme,
    setTheme: (newTheme: 'light' | 'dark') => setTheme(newTheme)
  };
};