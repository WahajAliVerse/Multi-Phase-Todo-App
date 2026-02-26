/**
 * Server-side logout API route
 * 
 * This route is used to properly log out users by:
 * 1. Calling backend logout endpoint (clears cookies, blacklists tokens)
 * 2. Clearing any server-side session data
 * 
 * The frontend Redux state will be cleared by the client-side logout action.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8003/api';

export async function POST(request: NextRequest) {
  try {
    // Get cookies from the request
    const cookies = request.cookies.getAll();
    
    // Build cookie header for backend request
    const cookieHeader = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    // Also get Authorization header if present
    const authHeader = request.headers.get('Authorization');

    // Call backend logout endpoint
    const backendResponse = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies to backend
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        // Forward Authorization header if present
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      credentials: 'include',
    });

    if (backendResponse.ok) {
      const result = await backendResponse.json();
      
      // Create response to clear cookies on frontend
      const response = NextResponse.json({
        success: true,
        message: result.detail || 'Logged out successfully',
      });

      // Clear any auth-related cookies on the frontend domain
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('auth_token');

      return response;
    }

    // Even if backend fails, clear frontend cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out',
    });

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear cookies even on error
    const response = NextResponse.json({
      success: true,
      message: 'Logged out',
    });

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('auth_token');

    return response;
  }
}
