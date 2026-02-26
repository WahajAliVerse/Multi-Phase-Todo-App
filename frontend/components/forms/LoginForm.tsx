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
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const navigateToDashboard = () => {
    console.log('[LoginForm] Attempting navigation to dashboard...');
    
    // Primary: Try Next.js router
    try {
      router.push('/dashboard');
      console.log('[LoginForm] router.push called successfully');
    } catch (routerError) {
      console.error('[LoginForm] router.push failed:', routerError);
      
      // Fallback: Use window.location for hard navigation
      try {
        console.log('[LoginForm] Falling back to window.location.href');
        window.location.href = '/dashboard';
      } catch (fallbackError) {
        console.error('[LoginForm] All navigation methods failed:', fallbackError);
        dispatch(addNotification({
          type: 'error',
          message: 'Login successful but navigation failed. Please refresh the page.'
        }));
      }
    }
  };

  const onSubmit = async (data: LoginData) => {
    try {
      console.log('[LoginForm] Attempting login...');
      console.log('[LoginForm] Login payload:', { email: data.email, password: '***' });
      
      // Dispatch login action
      const result = await dispatch(loginUser(data)).unwrap();
      console.log('[LoginForm] Login successful! Response:', result);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        message: 'Login successful! Welcome back.'
      }));

      // Small delay to ensure Redux state and cookies are fully updated
      // This prevents race conditions with middleware
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[LoginForm] Calling onSuccess callback...');
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // If no callback provided, navigate directly
        console.log('[LoginForm] No onSuccess callback, navigating directly...');
        navigateToDashboard();
      }
    } catch (error: any) {
      console.error('[LoginForm] Login failed:', error);
      console.error('[LoginForm] Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response?.data
      });
      
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Login failed. Please check your credentials.'
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