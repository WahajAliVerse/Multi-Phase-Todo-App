'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginData } from '@/utils/validators';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAppDispatch } from '@/redux/hooks';
import { loginUser, fetchUserProfile } from '@/redux/slices/authSlice';
import { fetchTags } from '@/redux/slices/tagsSlice';
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
      console.log('[LoginForm] Attempting login...');
      await dispatch(loginUser(data)).unwrap();
      console.log('[LoginForm] Login successful!');
      dispatch(addNotification({
        type: 'success',
        message: 'Login successful! Welcome back.'
      }));

      if (onSuccess) {
        console.log('[LoginForm] Calling onSuccess callback...');
        onSuccess();
      } else {
        console.warn('[LoginForm] No onSuccess callback provided!');
      }
    } catch (error: any) {
      console.error('[LoginForm] Login failed:', error);
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Login failed'
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
            className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80">
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
  );
};

export default LoginForm;