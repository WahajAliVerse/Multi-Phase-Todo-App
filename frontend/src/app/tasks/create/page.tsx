'use client';

import React, { useState, useEffect } from 'react';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/Button';
import { Task, Tag } from '@/lib/types';
import { useAppDispatch } from '@/store/hooks';
import { addOrUpdateTask } from '@/store/slices/tasksSlice';
import { 
  useGetTagsQuery, 
  useCreateTaskMutation,
  useGetAllRecurrencePatternsQuery,
  useGetAllRemindersQuery
} from '@/lib/api';

// Define the page component
export default function CreateTaskPage() {
  const dispatch = useAppDispatch();
  const [createTask, { isLoading, isError, error }] = useCreateTaskMutation();
  
  // Fetch related data
  const { data: tags = [], isLoading: tagsLoading } = useGetTagsQuery();
  const { data: recurrencePatterns = [], isLoading: recurrenceLoading } = useGetAllRecurrencePatternsQuery();
  const { data: reminders = [], isLoading: remindersLoading } = useGetAllRemindersQuery();

  // Handle form submission
  const handleSubmit = async (task: Task) => {
    try {
      // Prepare the task data for the API
      // The API expects tag IDs, recurrence pattern ID, and reminder IDs
      const taskData = {
        ...task,
        tagIds: task.tags?.map(tag => tag.id) || [],
        recurrencePatternId: task.recurrencePattern?.id,
        reminderIds: task.reminders?.map(reminder => reminder.id) || [],
      };

      // Remove the full objects since the API expects IDs only
      const { tags, recurrencePattern, reminders, ...apiTaskData } = taskData;

      // Call the API to create the task
      const result = await createTask(apiTaskData).unwrap();
      
      // Update local state
      dispatch(addOrUpdateTask(result));
      
      // Redirect to task list or show success message
      console.log('Task created successfully:', result);
      // In a real app, you might redirect to the task list page
      // router.push('/tasks');
    } catch (err) {
      console.error('Error creating task:', err);
      // Handle error (show notification, etc.)
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    // In a real app, you might redirect to the task list page
    // router.push('/tasks');
    console.log('Cancelled creating task');
  };

  // Show loading state while fetching related data
  if (tagsLoading || recurrenceLoading || remindersLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
        <div className="text-center py-8">Loading form data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
      
      {isError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error creating task: {error?.toString()}
        </div>
      )}
      
      <TaskForm
        tags={tags}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}