import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { useTheme as useNextThemes } from 'next-themes';

interface ThemeContextType {
  themeMode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Unified theme configurations that align with Tailwind CSS variables
export const lightTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6', // Tailwind blue-500
      light: '#93c5fd', // Tailwind blue-300
      dark: '#2563eb', // Tailwind blue-600
    },
    secondary: {
      main: '#8b5cf6', // Tailwind violet-500
      light: '#c4b5fd', // Tailwind violet-300
      dark: '#7c3aed', // Tailwind violet-600
    },
    background: {
      default: '#f9fafb', // Tailwind gray-50
      paper: '#ffffff',
    },
    text: {
      primary: '#111827', // Tailwind gray-900
      secondary: '#6b7280', // Tailwind gray-500
    },
    error: {
      main: '#ef4444', // Tailwind red-500
    },
    warning: {
      main: '#f59e0b', // Tailwind amber-500
    },
    info: {
      main: '#3b82f6', // Tailwind blue-500
    },
    success: {
      main: '#10b981', // Tailwind emerald-500
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem', // 8px to match Tailwind default
        },
      },
    },
  },
});

export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa', // Tailwind blue-400
      light: '#93c5fd', // Tailwind blue-300
      dark: '#3b82f6', // Tailwind blue-500
    },
    secondary: {
      main: '#a78bfa', // Tailwind violet-400
      light: '#c4b5fd', // Tailwind violet-300
      dark: '#8b5cf6', // Tailwind violet-500
    },
    background: {
      default: '#030712', // Tailwind gray-950
      paper: '#111827', // Tailwind gray-900
    },
    text: {
      primary: '#f9fafb', // Tailwind gray-50
      secondary: '#9ca3af', // Tailwind gray-400
    },
    error: {
      main: '#f87171', // Tailwind red-400
    },
    warning: {
      main: '#fbbf24', // Tailwind amber-400
    },
    info: {
      main: '#60a5fa', // Tailwind blue-400
    },
    success: {
      main: '#34d399', // Tailwind emerald-400
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem', // 8px to match Tailwind default
        },
      },
    },
  },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextThemes();
  const [themeMode, setThemeMode] = useState<PaletteMode>('light');

  useEffect(() => {
    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme) {
      const mode = savedTheme as PaletteMode;
      setThemeMode(mode);
      setNextTheme(mode);
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const mode = prefersDark ? 'dark' : 'light';
      setThemeMode(mode);
      setNextTheme(mode);
    }
  }, [setNextTheme]);

  useEffect(() => {
    // Sync with next-themes
    if (nextTheme) {
      setThemeMode(nextTheme as PaletteMode);
    }
  }, [nextTheme]);

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('theme-mode', newMode);
    setNextTheme(newMode);
  };

  const currentTheme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <MuiThemeProvider theme={currentTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};