'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error | null }>;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError(event.error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    // Use custom fallback component if provided, otherwise use default
    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent error={error} />;
    }

    // Default fallback UI
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">Something went wrong</h2>
        <p className="text-red-600 dark:text-red-300 mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return children;
};

export default ErrorBoundary;