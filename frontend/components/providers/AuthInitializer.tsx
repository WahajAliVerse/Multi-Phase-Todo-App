'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/authSlice';
import { fetchTags } from '@/redux/slices/tagsSlice';
import { initializeApiConnection } from '@/utils/apiHealth';

export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Initialize API connection and check health on initial load
  useEffect(() => {
    initializeApiConnection();
  }, []);

  // Load user profile and tags on initial load to get theme preference and populate tags
  useEffect(() => {
    if (isAuthenticated && !user) { // Only fetch if user is not already loaded
      dispatch(fetchUserProfile());
    }
    
    // Fetch tags to ensure they're available for UI components
    // If authenticated, fetch user-specific tags; if not authenticated, still fetch public tags if applicable
    dispatch(fetchTags());
  }, [isAuthenticated, user, dispatch]);

  return null; // This component doesn't render anything
}