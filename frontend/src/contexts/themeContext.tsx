// contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system">
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useNextTheme();
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  // Return a consistent interface
  return {
    theme: context.resolvedTheme as Theme,
    setTheme: context.setTheme,
    toggleTheme: () => context.setTheme(context.resolvedTheme === 'dark' ? 'light' : 'dark'),
  };
}