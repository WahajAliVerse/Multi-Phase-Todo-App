'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterData } from '@/utils/validators';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAppDispatch } from '@/redux/hooks';
import { registerUser, fetchUserProfile } from '@/redux/slices/authSlice';
import { fetchTags } from '@/redux/slices/tagsSlice';
import { addNotification } from '@/redux/slices/uiSlice';
import Link from 'next/link';

const RegisterForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Registration successful! Welcome to our app.'
      }));

      // After successful registration (status 200), fetch user profile and tags
      await dispatch(fetchUserProfile()).unwrap();
      await dispatch(fetchTags()).unwrap();

      // Wait a moment to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Registration failed'
      }));
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-md shadow-sm space-y-4">
        <div>
          <Input
            label="Email"
            placeholder="Enter your email"
            error={errors.email?.message}
            fullWidth
            {...register('email')}
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
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            fullWidth
            {...register('password')}
          />
        </div>
      </div>

      <div>
        <Button
          variant="primary"
          type="submit"
          fullWidth
          isLoading={isSubmitting}
        >
          Sign Up
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;