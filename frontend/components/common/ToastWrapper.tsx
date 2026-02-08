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
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
        
        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: '#28a745',
            color: '#fff',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#dc3545',
            color: '#fff',
          },
        },
        loading: {
          style: {
            background: '#333',
            color: '#fff',
          },
        },
      }}
    />
  );
};

export default ToastWrapper;