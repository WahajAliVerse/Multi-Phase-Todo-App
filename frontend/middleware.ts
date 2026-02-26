import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware for Authentication and Route Protection
 *
 * SECURITY ARCHITECTURE (DUAL AUTH):
 *
 * Problem: Backend cookies (e.g., hf.space) cannot be read by frontend
 * middleware running on a different origin (e.g., vercel.app).
 *
 * Solution: Client-side route protection with dual auth
 * 1. Primary Auth: Bearer token in Redux state (memory only, NOT localStorage)
 * 2. Secondary Auth: HTTP-only cookies set by backend (for API calls)
 * 3. Route Protection: Client-side via ProtectedRouteHandler component
 *
 * Flow:
 * - Login: Backend sets HTTP-only cookie + returns token in response
 * - Frontend: Stores token in Redux memory (cleared on refresh)
 * - API calls: Send BOTH Authorization header (Bearer) + cookies
 * - Route Protection: Client-side checks Redux state
 * - Backend: Validates both cookie AND token (dual verification)
 *
 * Protected Routes (client-side enforced):
 * - /dashboard/* - Requires authentication
 * - /tasks/* - Requires authentication
 * - /profile/* - Requires authentication
 * - /tags/* - Requires authentication
 *
 * Auth Routes (redirect if authenticated):
 * - /login, /register - Public (client redirects if already logged in)
 *
 * SECURITY BENEFITS:
 * ✅ Token never stored in localStorage (XSS-proof)
 * ✅ HTTP-only cookies remain secure (JavaScript cannot access)
 * ✅ Dual auth provides redundancy
 * ✅ Middleware minimal - no insecure cookie reading across origins
 */

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/tasks',
  '/profile',
  '/tags',
];

// Define auth routes (redirect if already authenticated)
const AUTH_ROUTES = [
  '/login',
  '/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // CRITICAL: Do NOT check cookies here
  // Cookies set by backend are on a different origin and cannot be read
  // Route protection is handled client-side by ProtectedRouteHandler
  // using Redux state (which holds the Bearer token in memory)

  // Check if accessing protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname.startsWith(route)
  );

  // Check if accessing auth route
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname.startsWith(route)
  );

  // For protected and auth routes, allow access
  // Client-side ProtectedRouteHandler will handle the actual auth check
  // This prevents redirect loops caused by cross-origin cookie issues

  // Log for debugging (remove in production if needed)
  console.log('[Middleware] Path:', pathname, {
    isProtectedRoute,
    isAuthRoute,
    note: 'Auth check delegated to client-side ProtectedRouteHandler',
  });

  // For all routes, allow access - client-side handles auth
  // The API will reject unauthenticated requests anyway (dual auth)
  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)',
  ],
};
