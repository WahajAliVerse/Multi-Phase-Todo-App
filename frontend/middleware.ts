import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the session cookie or authentication token
  const token = request.cookies.get('access_token') || request.headers.get('Authorization');

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/tasks', '/tags'];
  const authRoutes = ['/login', '/register'];

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // If user is on an auth route but already authenticated, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is on a protected route but not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Special handling for the root route
  if (request.nextUrl.pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico).*)',
  ],
};