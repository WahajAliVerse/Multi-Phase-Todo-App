'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, CreateTaskData } from '@/utils/validators';
import { Task } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAppDispatch } from '@/redux/hooks';
import { createTask, updateTask } from '@/redux/slices/tasksSlice';
import { addNotification } from '@/redux/slices/uiSlice';

const TaskForm: React.FC<{ 
  task?: Partial<Task>; 
  onSubmitCallback?: () => void; 
  onCancel?: () => void 
}> = ({ task, onSubmitCallback, onCancel }) => {
  const dispatch = useAppDispatch();
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
      if (task?.id) {
        // Update existing task
        await dispatch(updateTask({ id: task.id, taskData: data })).unwrap();
      } else {
        // Create new task
        await dispatch(createTask(data)).unwrap();
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
        <input
          type="text"
          value={tagsValue?.join(', ') || ''}
          onChange={handleTagsChange}
          placeholder="work, personal, urgent"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
        />
        <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
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