'use client';

import React from 'react';
import Link from 'next/link';
import LoginForm from '@/components/forms/LoginForm';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const router = useRouter();

  const handleLoginSuccess = () => {
    console.log('[LoginPage] Login successful callback triggered');
    console.log('[LoginPage] Current router state:', { pathname: window.location.pathname });
    
    // Primary navigation method: Next.js router
    try {
      console.log('[LoginPage] Attempting router.push to /dashboard...');
      const pushResult = router.push('/dashboard');
      console.log('[LoginPage] router.push completed:', pushResult);
    } catch (error) {
      console.error('[LoginPage] router.push failed:', error);
      
      // Fallback: Hard navigation using window.location
      try {
        console.log('[LoginPage] Falling back to window.location.href');
        window.location.href = '/dashboard';
      } catch (fallbackError) {
        console.error('[LoginPage] All navigation methods failed:', fallbackError);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary/80">
              create a new account
            </Link>
          </p>
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />
      </motion.div>
    </div>
  );
};

export default LoginPage;