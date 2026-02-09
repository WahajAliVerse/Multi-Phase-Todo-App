'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTagSchema, CreateTagData } from '@/utils/validators';
import { Tag } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createTag, updateTag } from '@/redux/slices/tagsSlice';
import { addNotification } from '@/redux/slices/uiSlice';

const TagForm: React.FC<{
  tag?: Partial<Tag>;
  onSubmitCallback?: () => void;
  onCancel?: () => void
}> = ({ tag, onSubmitCallback, onCancel }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTagData>({
    resolver: zodResolver(createTagSchema),
    defaultValues: tag || {
      name: '',
      color: '#3B82F6', // Default indigo color
    },
  });

  const onSubmit = async (data: CreateTagData) => {
    try {
      if (tag?.id) {
        await dispatch(updateTag({ id: tag.id, tagData: data })).unwrap();
      } else {
        // Include user ID when creating a new tag (using camelCase for backend compatibility)
        const tagDataWithUserId = {
          ...data,
          userId: user?.id
        };
        
        // Log the data being sent for debugging
        console.log('Sending tag data:', tagDataWithUserId);
        
        await dispatch(createTag(tagDataWithUserId)).unwrap();
      }

      dispatch(addNotification({
        type: 'success',
        message: tag?.id ? 'Tag updated successfully!' : 'Tag created successfully!'
      }));

      if (onSubmitCallback) {
        onSubmitCallback();
      } else {
        reset();
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to save tag'
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          label="Tag Name"
          placeholder="Enter tag name"
          error={errors.name?.message}
          fullWidth
          {...register('name')}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Color
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            {...register('color')}
            defaultValue="#3B82F6"
            className="w-12 h-10 border-0 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            {...register('color')}
            placeholder="#3B82F6"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
          />
        </div>
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
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
          {tag?.id ? 'Update Tag' : 'Create Tag'}
        </Button>
      </div>
    </form>
  );
};

export default TagForm;