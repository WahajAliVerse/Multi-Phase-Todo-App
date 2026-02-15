'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/authSlice';
import { fetchTags } from '@/redux/slices/tagsSlice';
import { initializeApiConnection } from '@/utils/apiHealth';

export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const [rehydrationComplete, setRehydrationComplete] = useState(false);

  // Initialize API connection and check health on initial load
  useEffect(() => {
    initializeApiConnection();
  }, []);

  // Track when rehydration is complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setRehydrationComplete(true);
    }, 100); // Small delay to ensure rehydration is complete

    return () => clearTimeout(timer);
  }, []);

  // Load user profile and tags after rehydration is complete
  useEffect(() => {
    // Only proceed after rehydration is complete
    if (!rehydrationComplete) return;

    // If the user is already authenticated after rehydration, fetch profile first, then tags
    if (isAuthenticated && user) {
      // Fetch user profile first to ensure session is valid
      dispatch(fetchUserProfile())
        .unwrap()
        .then(() => {
          // After profile is fetched successfully, fetch tags
          dispatch(fetchTags());
        })
        .catch(error => {
          console.error('Failed to fetch user profile on initialization:', error);
        });
    }
    // If not authenticated but we have a token, try to fetch profile to validate the session
  }, [isAuthenticated, user?.id, rehydrationComplete]); // Using user.id instead of the whole user object to prevent infinite loop

  return null; // This component doesn't render anything
}