/**
 * Authentication utilities for handling redirects and session management
 */

/**
 * Redirects to login page and stores the current URL for redirect after login
 */
export function redirectToLogin(): void {
  if (typeof window !== 'undefined' && window.location) {
    // Store the current URL so we can redirect back after login
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    window.location.href = '/login';
  }
}

/**
 * Gets the redirect URL stored after authentication
 */
export function getRedirectAfterLogin(): string | null {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem('redirectAfterLogin');
  }
  return null;
}

/**
 * Clears the redirect URL after successful login
 */
export function clearRedirectAfterLogin(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('redirectAfterLogin');
  }
}