// contexts/NotificationContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';

interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    // In a real app, this would trigger a toast notification
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // For browser notifications (if permission granted)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(message, {
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(message, {
              icon: '/favicon.ico',
              badge: '/favicon.ico'
            });
          }
        });
      }
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}