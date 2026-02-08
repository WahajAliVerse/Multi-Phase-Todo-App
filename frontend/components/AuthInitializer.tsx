'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { initializeAuth } from '@/lib/store/slices/authSlice';

// Component to initialize auth state when the app loads
const AuthInitializer = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state based on token in localStorage
    dispatch(initializeAuth());
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default AuthInitializer;