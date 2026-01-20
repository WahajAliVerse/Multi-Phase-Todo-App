'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackUrl = '/login' 
}) => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);

  useEffect(() => {
    // If user is not authenticated and not still loading, redirect to login
    if (!loading && !isAuthenticated) {
      router.push(fallbackUrl);
    }
  }, [isAuthenticated, loading, router, fallbackUrl]);

  // Show nothing while checking authentication status
  if (!isAuthenticated && loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If authenticated, render the child components
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not loading, return null (router will handle redirect)
  return null;
};

export default ProtectedRoute;