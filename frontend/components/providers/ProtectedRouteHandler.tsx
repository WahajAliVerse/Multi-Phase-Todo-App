'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';

export function ProtectedRouteHandler() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // This component is kept for any client-side specific logic that can't be handled by middleware
  // Currently, the routing is handled by middleware, but we keep this for potential future use

  return null; // This component doesn't render anything
}