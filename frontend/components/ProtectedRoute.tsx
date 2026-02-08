'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/lib/store';
import { initializeAuth, selectAuthLoading, selectIsAuthenticated } from '@/lib/store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional fallback while checking auth
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  ) 
}) => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuthentication = async () => {
      // Initialize auth state based on token
      await dispatch(initializeAuth());
      setInitialized(true);
    };

    initializeAuthentication();
  }, [dispatch]);

  useEffect(() => {
    // If auth is initialized and user is not authenticated, redirect to login
    if (initialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [initialized, isAuthenticated, router]);

  // Show fallback while initializing or if not authenticated
  if (isLoading || !initialized || !isAuthenticated) {
    return fallback;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;