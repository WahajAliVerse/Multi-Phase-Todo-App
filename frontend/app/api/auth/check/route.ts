/**
 * Server-side authentication check API route
 * 
 * This route is used by middleware to verify authentication status.
 * It forwards the request to the backend API and returns the auth status.
 * 
 * SECURITY:
 * - Runs on server-side (can access cookies)
 * - Forwards cookies to backend for verification
 * - Sets frontend_auth cookie for middleware to read
 * - Returns minimal auth status (no sensitive data)
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8003/api';

// Cookie configuration
const AUTH_COOKIE_NAME = 'frontend_auth';
const COOKIE_MAX_AGE = 30 * 60; // 30 minutes (matches access token expiry)

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the request
    const cookies = request.cookies.getAll();
    
    // Build cookie header for backend request
    const cookieHeader = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    // Forward request to backend auth endpoint
    const backendResponse = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies to backend for authentication
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      // Important: Allow cookies to be forwarded
      credentials: 'include',
    });

    // Handle different response statuses
    if (backendResponse.ok) {
      // User is authenticated
      const userData = await backendResponse.json();
      
      // Create response with auth cookie
      const response = NextResponse.json({
        isAuthenticated: true,
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
        },
      });
      
      // Set frontend auth cookie for middleware
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });
      
      return response;
    }

    if (backendResponse.status === 401 || backendResponse.status === 404) {
      // User is not authenticated - clear auth cookie
      const response = NextResponse.json(
        {
          isAuthenticated: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
      
      // Clear frontend auth cookie
      response.cookies.delete(AUTH_COOKIE_NAME);
      
      return response;
    }

    // Other errors - clear auth cookie
    const response = NextResponse.json(
      {
        isAuthenticated: false,
        error: 'Authentication check failed',
      },
      { status: backendResponse.status }
    );
    
    response.cookies.delete(AUTH_COOKIE_NAME);
    
    return response;
  } catch (error) {
    console.error('Auth check error:', error);
    
    const response = NextResponse.json(
      {
        isAuthenticated: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
    
    response.cookies.delete(AUTH_COOKIE_NAME);
    
    return response;
  }
}

export async function POST(request: NextRequest) {
  /**
   * Validate a token passed in the request body
   * This is used for token-based auth verification
   * Sets frontend_auth cookie on success
   */
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      const response = NextResponse.json(
        {
          isAuthenticated: false,
          error: 'No token provided',
        },
        { status: 400 }
      );
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    // Validate token with backend
    const backendResponse = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (backendResponse.ok) {
      const userData = await backendResponse.json();
      
      const response = NextResponse.json({
        isAuthenticated: true,
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
        },
      });
      
      // Set frontend auth cookie for middleware
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });
      
      return response;
    }

    const response = NextResponse.json(
      {
        isAuthenticated: false,
        error: 'Invalid token',
      },
      { status: 401 }
    );
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('Token validation error:', error);

    const response = NextResponse.json(
      {
        isAuthenticated: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}
