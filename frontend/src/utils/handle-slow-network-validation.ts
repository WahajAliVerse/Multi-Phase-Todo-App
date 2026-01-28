// Implementation to handle edge case: form validation under slow network conditions
import { useState, useEffect, useRef } from 'react';

// Hook to handle form validation under slow network conditions
export const useFormValidationWithNetworkHandling = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'slow' | 'complete'>('idle');
  const [lastValidationTime, setLastValidationTime] = useState<number | null>(null);
  
  // Detect slow network conditions
  useEffect(() => {
    // Check for slow connection based on Network Information API (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const isSlow = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
        setIsSlowConnection(isSlow);
      }
    }
    
    // Fallback: measure network performance
    const measureNetworkSpeed = async () => {
      const startTime = performance.now();
      
      try {
        // Make a simple request to measure response time
        await fetch('/api/ping', { method: 'HEAD' });
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Consider connection slow if response time is over 1000ms
        setIsSlowConnection(responseTime > 1000);
        setLastValidationTime(responseTime);
      } catch (error) {
        // If ping fails, assume slow connection
        setIsSlowConnection(true);
      }
    };
    
    measureNetworkSpeed();
    
    // Re-check periodically
    const interval = setInterval(measureNetworkSpeed, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(interval);
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, []);
  
  // Function to validate form with network awareness
  const validateFormWithNetworkHandling = async (
    formData: any,
    validationFunction: (data: any) => Promise<any>,
    onValidationStart?: () => void,
    onValidationComplete?: (result: any) => void
  ) => {
    if (onValidationStart) onValidationStart();
    
    setValidationStatus('validating');
    
    // Set a timeout to detect slow validation
    const timeout = setTimeout(() => {
      setValidationStatus('slow');
    }, 2000); // Consider validation slow if taking more than 2 seconds
    
    setValidationTimeout(timeout);
    
    try {
      const result = await validationFunction(formData);
      
      // Clear the timeout since validation completed
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
      
      setValidationStatus('complete');
      setLastValidationTime(Date.now());
      
      if (onValidationComplete) {
        onValidationComplete(result);
      }
      
      return result;
    } catch (error) {
      // Clear the timeout in case of error
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
      
      setValidationStatus('complete');
      
      throw error;
    }
  };
  
  return {
    isSlowConnection,
    validationStatus,
    lastValidationTime,
    validateFormWithNetworkHandling,
  };
};

// Component to display appropriate feedback based on network conditions
import React from 'react';

type NetworkAwareValidationProps = {
  children: React.ReactNode;
  isSlowConnection: boolean;
  validationStatus: 'idle' | 'validating' | 'slow' | 'complete';
};

export const NetworkAwareValidation: React.FC<NetworkAwareValidationProps> = (props) => {
  if (props.validationStatus === 'slow' || props.isSlowConnection) {
    return React.createElement(
      'div',
      { className: 'network-warning' },
      React.createElement('p', {}, 'Network connection appears to be slow. Validation may take longer than usual.'),
      props.children
    );
  }

  return React.createElement(React.Fragment, {}, props.children);
};

// Hook to debounce validation based on network conditions
export const useNetworkAwareDebounce = (delay: number = 300) => {
  const [isSlowConnection] = useState(() => {
    // Check for slow connection based on Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
      }
    }
    return false;
  });
  
  // Increase delay for slow connections
  const adjustedDelay = isSlowConnection ? delay * 3 : delay; // Triple the delay for slow connections
  
  const [debouncedValue, setDebouncedValue] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSetValue = (value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, adjustedDelay);
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return { debouncedValue, debouncedSetValue, isSlowConnection, adjustedDelay };
};

// Form validation component that adapts to network conditions
type NetworkAwareFormValidatorProps = {
  value: string;
  validationFunction: (value: string) => Promise<any>;
  onValidationComplete: (isValid: boolean, error?: string) => void;
  debounceDelay?: number;
};

export const NetworkAwareFormValidator: React.FC<NetworkAwareFormValidatorProps> = ({ 
  value, 
  validationFunction, 
  onValidationComplete,
  debounceDelay = 300
}) => {
  const { debouncedValue, debouncedSetValue, isSlowConnection, adjustedDelay } = useNetworkAwareDebounce(debounceDelay);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidationResult, setLastValidationResult] = useState<{ isValid: boolean; error?: string } | null>(null);
  
  useEffect(() => {
    debouncedSetValue(value);
  }, [value, debouncedSetValue]);
  
  useEffect(() => {
    if (debouncedValue) {
      const validate = async () => {
        setIsValidating(true);
        
        try {
          const result = await validationFunction(debouncedValue);
          const isValid = !result.error; // Assuming validation function returns error property if invalid
          
          setLastValidationResult({ isValid, error: result.error });
          onValidationComplete(isValid, result.error);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Validation failed';
          setLastValidationResult({ isValid: false, error: errorMessage });
          onValidationComplete(false, errorMessage);
        } finally {
          setIsValidating(false);
        }
      };
      
      validate();
    } else {
      // If no value, clear previous validation result
      setLastValidationResult(null);
      onValidationComplete(true); // Consider empty value as valid initially
    }
  }, [debouncedValue, validationFunction, onValidationComplete]);
  
  return React.createElement(
    'div',
    { className: 'network-aware-validator' },
    isValidating && React.createElement(
      'div',
      { className: 'validation-indicator' },
      isSlowConnection ? 'Validating (slow connection)...' : 'Validating...'
    ),
    lastValidationResult && !isValidating && React.createElement(
      'div',
      { className: `validation-result ${lastValidationResult.isValid ? 'valid' : 'invalid'}` },
      lastValidationResult.isValid ? '✓ Valid' : `✗ ${lastValidationResult.error}`
    )
  );
};

// Example usage in a form component
export const FormWithNetworkHandling = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { validateFormWithNetworkHandling, isSlowConnection, validationStatus } = useFormValidationWithNetworkHandling();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = async (email: string) => {
    // Simulate API call for email validation
    return new Promise<{ isValid: boolean; error?: string }>((resolve) => {
      setTimeout(() => {
        // Simple validation logic
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        resolve({
          isValid,
          error: isValid ? undefined : 'Please enter a valid email address'
        });
      }, isSlowConnection ? 2000 : 500); // Longer delay for slow connections
    });
  };

  const handleEmailValidation = async () => {
    return validateFormWithNetworkHandling(
      formData.email,
      validateEmail,
      () => console.log('Email validation started'),
      (result) => console.log('Email validation result:', result)
    );
  };

  return React.createElement(
    NetworkAwareValidation,
    {
      isSlowConnection,
      validationStatus,
      children: React.createElement(
        'form',
        {},
        React.createElement(
          'div',
          {},
          React.createElement('label', { htmlFor: 'email' }, 'Email:'),
          React.createElement('input', {
            type: 'email',
            id: 'email',
            name: 'email',
            value: formData.email,
            onChange: handleInputChange
          }),
          React.createElement(NetworkAwareFormValidator, {
            value: formData.email,
            validationFunction: validateEmail,
            onValidationComplete: (isValid, error) => {
              console.log('Email validation:', { isValid, error });
            }
          })
        ),
        React.createElement(
          'div',
          {},
          React.createElement('label', { htmlFor: 'password' }, 'Password:'),
          React.createElement('input', {
            type: 'password',
            id: 'password',
            name: 'password',
            value: formData.password,
            onChange: handleInputChange
          })
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: handleEmailValidation,
            disabled: validationStatus === 'validating'
          },
          validationStatus === 'validating' ? 'Validating...' : 'Validate Email'
        )
      )
    }
  );
};