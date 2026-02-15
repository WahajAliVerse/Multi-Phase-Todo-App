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
import { fetchTags } from '@/redux/slices/tagsSlice';
import { useEffect } from 'react';
import { safeParseDate } from '@/utils/dateUtils';

const TaskForm: React.FC<{
  task?: Partial<Task>;
  onSubmitCallback?: () => void;
  onCancel?: () => void
}> = ({ task, onSubmitCallback, onCancel }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const allTags = useAppSelector(state => state.tags.tags) || [];
  const tagsLoading = useAppSelector(state => state.tags.loading);

  // Load tags when component mounts or when tags state is empty to ensure they're available for the dropdown
  useEffect(() => {
    if (allTags.length === 0) {
      dispatch(fetchTags());
    }
  }, [dispatch, allTags.length]);

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
      // Format dates to ensure they're in ISO 8601 format
      let formattedData = { ...data };

      if (data.dueDate) {
        // Use safeParseDate utility for consistent timezone handling
        const parsedDate = safeParseDate(data.dueDate);
        
        if (!parsedDate) {
          // Invalid date, show error
          dispatch(addNotification({
            type: 'error',
            message: 'Invalid date format. Please select a valid date.'
          }));
          return;
        }

        // Convert to ISO string ensuring proper timezone handling
        // Use UTC to avoid timezone issues
        formattedData = {
          ...data,
          dueDate: parsedDate.toISOString()
        };
      }

      // Validate that due date is not before current date if provided
      if (formattedData.dueDate) {
        const dueDate = new Date(formattedData.dueDate);
        const currentDate = new Date();

        // If due date is before current date, show warning
        if (dueDate < currentDate) {
          const confirmed = window.confirm('The due date is in the past. Are you sure you want to continue?');
          if (!confirmed) {
            return;
          }
        }
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
        <label className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-1 focus:ring-ring sm:text-sm border"
          placeholder="Enter task description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Priority
          </label>
          <select
            {...register('priority')}
            className="block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-1 focus:ring-ring sm:text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-destructive">{errors.priority.message}</p>
          )}
        </div>

        <div>
          <Input
            label="Due Date"
            type="datetime-local"
            error={errors.dueDate?.message}
            fullWidth
            {...register('dueDate')}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
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
            className="block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-1 focus:ring-ring sm:text-sm"
            disabled={tagsLoading} // Disable while tags are loading
          >
            <option value="">Select a tag...</option>
            {Array.isArray(allTags) && allTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          {tagsLoading && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(watch('tags') || []).map((tagId: string, index: number) => {
            const tag = Array.isArray(allTags) ? allTags.find(t => t.id === tagId) : undefined;
            return (
              <div key={tagId} className="relative inline-flex items-center">
                {tag ? (
                  <TagChip tag={tag} />
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {tagId}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const currentTags = watch('tags') || [];
                    setValue('tags', currentTags.filter((_, i) => i !== index));
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
        {errors.tags && (
          <p className="mt-1 text-sm text-destructive">{errors.tags.message}</p>
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