'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginData } from '@/utils/validators';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAppDispatch } from '@/redux/hooks';
import { loginUser } from '@/redux/slices/authSlice';
import { addNotification } from '@/redux/slices/uiSlice';
import Link from 'next/link';

const LoginForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      dispatch(addNotification({ 
        type: 'success', 
        message: 'Login successful! Welcome back.' 
      }));
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      dispatch(addNotification({ 
        type: 'error', 
        message: error.message || 'Login failed' 
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              create a new account
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
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                fullWidth
                {...register('password')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button 
              variant="primary" 
              type="submit" 
              fullWidth 
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;