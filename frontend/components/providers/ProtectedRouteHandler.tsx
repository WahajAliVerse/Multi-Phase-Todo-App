'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Client-side protected route handler.
 *
 * SECURITY ARCHITECTURE (DUAL AUTH):
 *
 * This component handles route protection on the client side because:
 * - Middleware cannot access HTTP-only cookies set by a different origin
 * - Backend sets cookies on its domain (e.g., hf.space)
 * - Frontend middleware runs on a different domain (e.g., vercel.app)
 *
 * Authentication Flow:
 * 1. Login: Backend sets HTTP-only cookie + returns Bearer token
 * 2. Frontend: Stores token in Redux memory (NOT localStorage)
 * 3. API calls: Send BOTH Authorization header + cookies (dual auth)
 * 4. Route Protection: This component checks Redux state
 *
 * Protected Routes:
 * - /dashboard/* - Requires authentication
 * - /tasks/* - Requires authentication
 * - /profile/* - Requires authentication
 * - /tags/* - Requires authentication
 *
 * Auth Routes (redirect if authenticated):
 * - /login, /register - Redirect to /dashboard if already logged in
 *
 * SECURITY NOTES:
 * - Token is stored in Redux memory only (cleared on page refresh)
 * - Token is NEVER stored in localStorage (XSS-proof)
 * - HTTP-only cookies provide backup authentication for API calls
 */

export function ProtectedRouteHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/tasks', '/tags'];
  
  // Define auth routes (redirect if already authenticated)
  const authRoutes = ['/login', '/register'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Initial hydration delay - wait for Redux to rehydrate from localStorage
  // Note: Token is NOT persisted, only user and isAuthenticated
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50); // Small delay to ensure Redux rehydration is complete
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Skip check during initial loading or before ready
    if (loading || !isReady) return;

    // Mark that we've checked auth
    setHasCheckedAuth(true);

    // If on a protected route and not authenticated, redirect to login
    if (isProtectedRoute && !isAuthenticated) {
      console.log('[ProtectedRouteHandler] Protected route accessed without auth, redirecting to login', {
        pathname,
        isAuthenticated,
      });
      router.replace('/login');
      return;
    }

    // If on an auth route and already authenticated, redirect to dashboard
    if (isAuthRoute && isAuthenticated) {
      console.log('[ProtectedRouteHandler] Auth route accessed while authenticated, redirecting to dashboard', {
        pathname,
        isAuthenticated,
      });
      router.replace('/dashboard');
      return;
    }
  }, [isAuthenticated, loading, isReady, pathname, isProtectedRoute, isAuthRoute, router]);

  // Optionally show a loading state during auth check on protected routes
  if (loading && isProtectedRoute && !hasCheckedAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null; // This component doesn't render anything visible
}
