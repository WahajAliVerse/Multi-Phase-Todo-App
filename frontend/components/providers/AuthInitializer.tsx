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
    // Attempt to fetch user profile to check authentication status
    dispatch(fetchUserProfile())
      .unwrap()
      .then(() => {
        // If profile fetch succeeds, fetch tags as well
        dispatch(fetchTags());
      })
      .catch((error) => {
        // If profile fetch fails with 401/404, the user is not authenticated
        // This is expected behavior, so we don't need to show an error
        console.log('User not authenticated:', error);
        // Still fetch tags to ensure they're available for public components
        dispatch(fetchTags());
      });
  }, [dispatch]);

  return null; // This component doesn't render anything
}