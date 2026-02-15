import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastWrapper: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Define default options
        className: '',
        duration: 3000,
        style: {
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        },

        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: 'var(--success)',
            color: 'var(--primary-foreground)',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: 'var(--destructive)',
            color: 'var(--destructive-foreground)',
          },
        },
        loading: {
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
          },
        },
      }}
    />
  );
};

export default ToastWrapper;