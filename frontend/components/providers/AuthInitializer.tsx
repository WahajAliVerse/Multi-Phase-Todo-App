'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/authSlice';
import { initializeApiConnection } from '@/utils/apiHealth';

export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Initialize API connection and check health on initial load
  useEffect(() => {
    initializeApiConnection();
  }, []);

  // Load user profile on initial load to get theme preference
  useEffect(() => {
    if (isAuthenticated && !user) { // Only fetch if user is not already loaded
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, user, dispatch]);

  return null; // This component doesn't render anything
}