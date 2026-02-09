import { toast } from 'react-hot-toast';

/**
 * Utility function to check if the backend API is accessible
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    // Remove the '/api' part to check the root endpoint
    const healthUrl = baseUrl.replace(/\/api$/, '') + '/health';
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.status === 'healthy';
    }
    return false;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Initialize API connection and show toast notification if connection fails
 */
export const initializeApiConnection = async () => {
  const isHealthy = await checkApiHealth();
  
  if (!isHealthy) {
    toast.error('⚠️ Unable to connect to the backend API. Please ensure the backend server is running.', {
      duration: 5000,
      position: 'top-right',
    });
  } else {
    console.log('✅ Successfully connected to the backend API');
  }
};