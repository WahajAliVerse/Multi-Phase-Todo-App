'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema, User } from '@/utils/validators';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateUserProfile } from '@/redux/slices/authSlice';
import { addNotification } from '@/redux/slices/uiSlice';

const ProfileForm: React.FC<{ user: User; onSuccess?: () => void }> = ({ user, onSuccess }) => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name || '',
      preferences: user.preferences || { theme: 'light' },
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await dispatch(updateUserProfile(data)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      }));

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to update profile'
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          label="Email"
          value={user.email}
          disabled
          fullWidth
        />
      </div>
      
      <div>
        <Input
          label="Name"
          placeholder="Enter your name"
          error={errors.name?.message}
          fullWidth
          {...register('name')}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Theme Preference
        </label>
        <select
          {...register('preferences.theme')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        {errors.preferences?.theme && (
          <p className="mt-1 text-sm text-red-600">{errors.preferences.theme.message}</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="primary" 
          type="submit" 
          isLoading={isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;