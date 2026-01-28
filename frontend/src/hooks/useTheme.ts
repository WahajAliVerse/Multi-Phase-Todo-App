import { useState, useEffect } from 'react';
import { PaletteMode } from '@mui/material';

// Custom hook for theme switching logic
export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<PaletteMode>('light');

  useEffect(() => {
    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme) {
      setThemeMode(savedTheme as PaletteMode);
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const setTheme = (mode: PaletteMode) => {
    setThemeMode(mode);
    localStorage.setItem('theme-mode', mode);
  };

  return { themeMode, toggleTheme, setTheme };
};