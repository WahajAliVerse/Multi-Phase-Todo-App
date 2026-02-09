'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, CreateTaskData } from '@/utils/validators';
import { Task, Tag } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TagChip from '@/components/common/TagChip';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createTask, updateTask } from '@/redux/slices/tasksSlice';
import { addNotification } from '@/redux/slices/uiSlice';

const TaskForm: React.FC<{
  task?: Partial<Task>;
  onSubmitCallback?: () => void;
  onCancel?: () => void
}> = ({ task, onSubmitCallback, onCancel }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const allTags = useAppSelector(state => state.tags.tags) || [];
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateTaskData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate || '',
      tags: task?.tags || [],
    },
  });

  // Watch the tags field to handle comma-separated input
  const tagsValue = watch('tags');
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setValue('tags', tagsArray);
  };

  const onSubmit = async (data: CreateTaskData) => {
    try {
      // Format dates to ensure they're in ISO format
      let formattedData = { ...data };

      if (data.dueDate) {
        // Check if the date is valid before converting
        const dateToProcess = new Date(data.dueDate);
        if (isNaN(dateToProcess.getTime())) {
          // Invalid date, show error
          dispatch(addNotification({
            type: 'error',
            message: 'Invalid date format. Please select a valid date.'
          }));
          return;
        }
        formattedData = {
          ...data,
          dueDate: dateToProcess.toISOString()
        };
      }

      if (task?.id) {
        // Update existing task
        const taskDataWithUserId = {
          ...formattedData,
          userId: user?.id
        };
        await dispatch(updateTask({ id: task.id, taskData: taskDataWithUserId })).unwrap();
      } else {
        // Create new task
        const taskDataWithUserId = {
          ...formattedData,
          userId: user?.id
        };
        await dispatch(createTask(taskDataWithUserId)).unwrap();
      }

      dispatch(addNotification({
        type: 'success',
        message: task?.id ? 'Task updated successfully!' : 'Task created successfully!'
      }));

      if (onSubmitCallback) {
        onSubmitCallback();
      } else {
        reset();
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to save task'
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          label="Title"
          placeholder="Enter task title"
          error={errors.title?.message}
          fullWidth
          {...register('title')}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
          placeholder="Enter task description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            {...register('priority')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>
        
        <div>
          <Input
            label="Due Date"
            type="date"
            error={errors.dueDate?.message}
            fullWidth
            {...register('dueDate')}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags
        </label>
        <div className="flex items-center space-x-2">
          <select
            value=""
            onChange={(e) => {
              const selectedTagId = e.target.value;
              if (selectedTagId) {
                const currentTags = watch('tags') || [];
                if (!currentTags.includes(selectedTagId)) {
                  setValue('tags', [...currentTags, selectedTagId]);
                }
                e.target.value = ''; // Reset the select to placeholder
              }
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
          >
            <option value="">Select a tag...</option>
            {allTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(watch('tags') || []).map((tagId: string, index: number) => {
            const tag = allTags.find(t => t.id === tagId);
            return (
              <div key={tagId} className="relative inline-flex items-center">
                {tag ? (
                  <TagChip tag={tag} />
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {tagId}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const currentTags = watch('tags') || [];
                    setValue('tags', currentTags.filter((_, i) => i !== index));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
        >
          {task?.id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;