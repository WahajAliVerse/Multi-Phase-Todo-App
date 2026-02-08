'use client';

import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchTasks } from '@/store/tasksSlice';
import { fetchTags } from '@/store/tagsSlice';
import { RootState } from '@/store';
import { store } from '@/store';
import ErrorDisplay from '@/components/ErrorDisplay';
import SuccessMessage from '@/components/SuccessMessage';

// Layout component that handles global state and error messages
const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { error: tasksError, successMessage: tasksSuccess } = useSelector((state: RootState) => state.tasks);
  const { error: tagsError, successMessage: tagsSuccess } = useSelector((state: RootState) => state.tags);

  useEffect(() => {
    // Load initial data
    dispatch(fetchTasks());
    dispatch(fetchTags());
  }, [dispatch]);

  // Clear errors and success messages when they appear
  useEffect(() => {
    if (tasksError || tagsError) {
      // Prevent page refresh on API failures - just show error message
      console.error('API Error:', tasksError || tagsError);
    }
  }, [tasksError, tagsError]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global error/success messages */}
      {(tasksError || tagsError) && (
        <div className="container mx-auto px-4 pt-4">
          <ErrorDisplay 
            error={tasksError || tagsError} 
          />
        </div>
      )}
      
      {(tasksSuccess || tagsSuccess) && (
        <div className="container mx-auto px-4 pt-4">
          <SuccessMessage 
            message={tasksSuccess || tagsSuccess} 
          />
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

// Wrapper component to provide Redux store
export const LayoutWithProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <GlobalLayout>{children}</GlobalLayout>
    </Provider>
  );
};

export default LayoutWithProvider;