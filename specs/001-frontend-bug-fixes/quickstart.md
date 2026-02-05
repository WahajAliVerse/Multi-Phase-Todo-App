# Quickstart Guide: Frontend Bug Fixes

## Overview
This guide provides step-by-step instructions to implement the fixes for CORS issues, API failures, and UI color visibility problems.

## Prerequisites
- Node.js 18+ and npm/yarn installed
- Access to the backend service for CORS configuration
- Understanding of the current frontend architecture (likely Next.js)

## Step 1: Configure CORS Settings

### Frontend Configuration
1. Update your API service/client to properly handle CORS headers and cookies:
   ```javascript
   // Example for fetch API
   const response = await fetch('/api/endpoint', {
     method: 'POST',
     credentials: 'include', // Important for cookie handling
     headers: {
       'Content-Type': 'application/json',
       // Ensure proper origin headers are sent
       'Origin': window.location.origin
     },
     body: JSON.stringify(data),
   });
   ```

2. Configure your API service to work with the existing backend CORS configuration for development origins (localhost:3000-3003)

## Step 2: Implement Error Handling

### Create an Error Handler Service
1. Create a new service file (e.g., `services/errorHandler.js`):
   ```javascript
   export const handleApiError = (error, context = '') => {
     console.error(`API Error in ${context}:`, error);
     
     // Determine user-friendly message based on error type
     if (error.name === 'TypeError' && error.message.includes('fetch')) {
       return {
         message: 'Network error. Please check your connection and try again.',
         canRetry: true
       };
     } else if (error.status >= 500) {
       return {
         message: 'Server error. Our team has been notified. Please try again later.',
         canRetry: true
       };
     } else if (error.status >= 400) {
       return {
         message: 'Request failed. Please check your input and try again.',
         canRetry: false
       };
     }
     
     return {
       message: 'An unexpected error occurred. Please try again.',
       canRetry: true
     };
   };
   ```

### Integrate Error Handling in API Calls
1. Update your API service to use the error handler:
   ```javascript
   import { handleApiError } from '../services/errorHandler';
   
   export const apiCall = async (endpoint, options = {}) => {
     try {
       const response = await fetch(endpoint, {
         ...options,
         credentials: 'include', // Include cookies if needed
       });
       
       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }
       
       return await response.json();
     } catch (error) {
       return handleApiError(error, endpoint);
     }
   };
   ```

## Step 3: Improve UI Color Contrast

### Audit Current Colors
1. Use a color contrast checker tool to identify elements that don't meet WCAG AA standards
2. Focus on:
   - Text on background colors
   - Button text on button backgrounds
   - Form labels and inputs
   - Links and interactive elements

### Update Color Palette
1. Create or update your color theme file:
   ```javascript
   // styles/theme.js (for Material UI) or similar
   export const themeColors = {
     primary: {
       main: '#1976d2',      // Good contrast against white
       contrastText: '#fff',  // White text on primary background
     },
     secondary: {
       main: '#dc004e',      // Good contrast against white
       contrastText: '#fff',
     },
     text: {
       primary: '#212121',   // Dark gray, good contrast on white
       secondary: '#757575', // Medium gray, good on white
       disabled: '#bdbdbd',  // Light gray, meets min contrast reqs
     },
     background: {
       default: '#fafafa',   // Very light gray
       paper: '#ffffff',     // White
     },
   };
   ```

### Apply Improved Colors
1. Update your components to use the new color palette:
   ```jsx
   // Example component with improved contrast
   import { Typography, Button } from '@mui/material';
   import { themeColors } from '../styles/theme';
   
   const MyComponent = () => (
     <div style={{ backgroundColor: themeColors.background.default }}>
       <Typography 
         variant="h6" 
         style={{ color: themeColors.text.primary }}
       >
         High contrast heading
       </Typography>
       <Button 
         variant="contained" 
         style={{ 
           backgroundColor: themeColors.primary.main,
           color: themeColors.primary.contrastText
         }}
       >
         Accessible Button
       </Button>
     </div>
   );
   ```

## Step 4: Performance Optimization

### Monitor API Response Times
1. Add timing measurements to your API calls:
   ```javascript
   export const timedApiCall = async (endpoint, options = {}) => {
     const startTime = Date.now();
     
     try {
       const response = await fetch(endpoint, options);
       const endTime = Date.now();
       const duration = endTime - startTime;
       
       // Log slow requests for monitoring
       if (duration > 200) {
         console.warn(`Slow API call to ${endpoint}: ${duration}ms`);
       }
       
       return response;
     } catch (error) {
       const endTime = Date.now();
       console.error(`API call failed after ${endTime - startTime}ms`);
       throw error;
     }
   };
   ```

## Step 5: Testing

### Manual Testing
1. Test CORS fixes:
   - Run frontend on localhost:3000-3003
   - Verify API calls succeed without CORS errors
   - Check browser console for CORS-related errors

2. Test error handling:
   - Temporarily disable backend service
   - Verify user-friendly error messages appear
   - Test retry functionality

3. Test color contrast:
   - Use browser tools or online contrast checkers
   - Verify all text meets minimum 4.5:1 contrast ratio
   - Test on different backgrounds

### Automated Testing
1. Add tests for error handling:
   ```javascript
   // Example test
   test('shows user-friendly error message on network failure', async () => {
     global.fetch = jest.fn(() => Promise.reject(new TypeError('Network error')));
     
     const result = await apiCall('/test');
     
     expect(result.message).toBe('Network error. Please check your connection and try again.');
     expect(result.canRetry).toBe(true);
   });
   ```

## Deployment
1. Test changes in staging environment that mirrors production
2. Verify CORS settings work correctly in production
3. Monitor performance metrics after deployment
4. Gather user feedback on UI improvements