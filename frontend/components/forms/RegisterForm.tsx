'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterData } from '@/utils/validators';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAppDispatch } from '@/redux/hooks';
import { registerUser } from '@/redux/slices/authSlice';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              sign in to your existing account
            </Link>
          </p>
        </div>
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
      </div>
    </div>
  );
};

export default RegisterForm;