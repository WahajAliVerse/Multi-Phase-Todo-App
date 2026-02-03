import { NextRequest, NextResponse } from 'next/server';

// Middleware to handle authentication and session management
export function middleware(request: NextRequest) {
  // Get the token from cookies or headers
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/tasks', '/profile', '/settings'];

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // If accessing a protected route without a valid token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check if the token is expired (this would require decoding the JWT if it's a JWT)
  // For this example, we'll assume the backend handles token validation
  if (token) {
    // In a real application, you might decode the JWT to check expiration
    // or make a request to a validation endpoint
    try {
      // If token validation fails, redirect to login
      // This is a simplified check - in reality, you'd validate the token
      if (isTokenExpired(token)) {
        // Clear the expired token
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token');
        return response;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      // If there's an error validating the token, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // Continue to the requested page
  return NextResponse.next();
}

// Helper function to check if token is expired (simplified)
function isTokenExpired(token: string): boolean {
  try {
    // If it's a JWT, decode and check exp claim
    if (token.split('.').length === 3) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    }
    // If not a JWT, assume it's valid (or implement your own validation)
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't validate, assume expired
  }
}

// Define which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};