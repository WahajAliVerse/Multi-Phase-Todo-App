'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/lib/store';
import { initializeAuth, selectAuthLoading, selectIsAuthenticated } from '@/lib/store/slices/authSlice';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    // Initialize auth state to check if user is already logged in
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // If loading or user is not authenticated, show the children
  if (isLoading || !isAuthenticated) {
    return <>{children}</>;
  }

  // If user is authenticated, don't render anything (they'll be redirected)
  return null;
};

export default PublicRoute;