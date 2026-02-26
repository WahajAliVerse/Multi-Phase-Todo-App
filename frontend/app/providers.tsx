'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Expose Redux store on window for API utilities to access auth token
    // This allows api.ts to get the token without circular dependencies
    if (typeof window !== 'undefined') {
      (window as any).__REDUX_STORE__ = store;
    }
    
    return () => {
      // Cleanup on unmount
      if (typeof window !== 'undefined') {
        delete (window as any).__REDUX_STORE__;
      }
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Provider store={store}>
        {mounted ? children : null}
      </Provider>
    </ThemeProvider>
  );
}