import { useState, useEffect } from 'react';

// Custom hook for detecting system theme preference
export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('system-theme-preference');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Default to light if no preference is set
    return 'light';
  });

  useEffect(() => {
    // Check if the browser supports the prefers-color-scheme media query
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setSystemTheme('dark');
    } else {
      setSystemTheme('light');
    }

    // Listen for changes to the system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newTheme);
      // Optionally save the detected system theme to localStorage
      localStorage.setItem('system-theme-preference', newTheme);
    };

    // For older browsers
    const legacyChangeHandler = () => {
      handleChange(mediaQuery as unknown as MediaQueryListEvent);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(legacyChangeHandler);
    }

    // Cleanup function
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(legacyChangeHandler);
      }
    };
  }, []);

  return { systemTheme, setSystemTheme };
};