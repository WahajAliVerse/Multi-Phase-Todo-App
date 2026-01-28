// Implementation of reduced motion preferences for accessibility
import { useState, useEffect } from 'react';
import React from 'react';

// Hook to detect user's reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    // Check localStorage first
    const savedPreference = localStorage.getItem('reduced-motion');
    if (savedPreference !== null) {
      return savedPreference === 'true';
    }
    
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // Default to false if no preference is set
    return false;
  });

  useEffect(() => {
    // Listen for changes to the system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const shouldReduceMotion = e.matches;
      setPrefersReducedMotion(shouldReduceMotion);
      
      // Save the preference to localStorage
      localStorage.setItem('reduced-motion', shouldReduceMotion.toString());
    };

    // For older browsers
    const legacyChangeHandler = () => {
      handleChange(mediaQuery as unknown as MediaQueryListEvent);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(legacyChangeHandler);
    }

    // Cleanup function
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(legacyChangeHandler);
      }
    };
  }, []);

  return prefersReducedMotion;
};

// Hook to conditionally apply animations based on user preference
export const useConditionalAnimation = (defaultDuration: number = 0.3) => {
  const prefersReducedMotion = useReducedMotion();
  
  return prefersReducedMotion ? 0 : defaultDuration;
};

// Utility function to conditionally apply animation properties
export const getAnimationProps = (defaultProps: any) => {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    // Return properties that disable or minimize animations
    return {
      ...defaultProps,
      transition: { duration: 0 },
      animate: { opacity: 1, scale: 1, x: 0, y: 0 },
      initial: { opacity: 1, scale: 1, x: 0, y: 0 },
    };
  }
  
  // Return the original animation properties
  return defaultProps;
};

// Component to wrap content that should respect reduced motion preferences
type ReducedMotionWrapperProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Content to show when reduced motion is enabled
};

export const ReducedMotionWrapper: React.FC<ReducedMotionWrapperProps> = ({
  children,
  fallback = null
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return fallback ? fallback : React.createElement(React.Fragment, {}, children);
  }

  return React.createElement(React.Fragment, {}, children);
};

// CSS utility class for reduced motion
export const reducedMotionStyles = `
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// Function to apply reduced motion styles to the document
export const applyReducedMotionStyles = () => {
  // Create a style element for reduced motion
  const styleElement = document.createElement('style');
  styleElement.id = 'reduced-motion-styles';
  styleElement.textContent = reducedMotionStyles;
  
  // Add to the document head
  document.head.appendChild(styleElement);
  
  // Listen for changes to the reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handleChange = () => {
    if (mediaQuery.matches) {
      document.body.setAttribute('data-reduced-motion', 'true');
    } else {
      document.body.removeAttribute('data-reduced-motion');
    }
  };
  
  // Set initial state
  handleChange();
  
  // Listen for changes
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else {
    // For older browsers
    mediaQuery.addListener(handleChange as any);
  }
  
  // Return cleanup function
  return () => {
    if (styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
    
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.removeListener(handleChange as any);
    }
  };
};