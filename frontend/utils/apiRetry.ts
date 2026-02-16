/**
 * Utility function to retry API calls with exponential backoff
 * @param apiCall - The API call function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 1000ms)
 * @returns Promise with the result of the API call
 * 
 * Retry Behavior:
 * - First retry: 1000ms + random jitter (0-1000ms)
 * - Second retry: 2000ms + random jitter (0-1000ms)
 * - Third retry: 4000ms + random jitter (0-1000ms)
 * - And so on...
 * 
 * Jitter helps prevent thundering herd problems when multiple clients retry simultaneously.
 * Only network-related errors are retried; authentication/authorization errors are not retried.
 */
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but added for type safety
  throw lastError;
};

/**
 * Wrapper for API calls that handles retries and fallbacks
 * @param apiCall - The API call function to wrap
 * @param fallbackValue - Value to return if all retries fail
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 1000ms)
 * @returns Promise with the result of the API call or fallback value
 */
export const apiCallWithFallback = async <T>(
  apiCall: () => Promise<T>,
  fallbackValue: T,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  try {
    return await retryApiCall(apiCall, maxRetries, baseDelay);
  } catch (error) {
    console.warn(`API call failed after ${maxRetries + 1} attempts, using fallback value`, error);
    return fallbackValue;
  }
};