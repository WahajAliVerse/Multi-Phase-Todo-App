// Implementation to handle edge case: rapid theme switching during animations
import { useState, useEffect, useRef } from 'react';

// Hook to handle rapid theme switching during animations
export const useRapidThemeSwitchingProtection = () => {
  const [isThemeSwitching, setIsThemeSwitching] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to initiate theme switching
  const startThemeSwitch = () => {
    // If already switching, clear the previous timeout to prevent conflicts
    if (isThemeSwitching && animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    setIsThemeSwitching(true);
  };
  
  // Function to complete theme switching
  const completeThemeSwitch = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    setIsThemeSwitching(false);
  };
  
  // Set a timeout to automatically reset the switching state after animations complete
  useEffect(() => {
    if (isThemeSwitching) {
      // Set timeout slightly longer than the longest animation duration (100ms)
      animationTimeoutRef.current = setTimeout(() => {
        setIsThemeSwitching(false);
      }, 150); // 150ms to ensure all animations complete
      
      // Cleanup function
      return () => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
      };
    }
  }, [isThemeSwitching]);
  
  return {
    isThemeSwitching,
    startThemeSwitch,
    completeThemeSwitch,
  };
};

// Component to wrap theme-dependent animations to prevent conflicts during rapid switching
import React from 'react';

type ThemeAnimationGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Fallback content during rapid switching
};

export const ThemeAnimationGuard: React.FC<ThemeAnimationGuardProps> = (props) => {
  const { isThemeSwitching } = useRapidThemeSwitchingProtection();

  // If a rapid theme switch is in progress, show fallback or suspend animations
  if (isThemeSwitching) {
    return React.createElement(React.Fragment, {}, props.fallback || React.createElement('div', {}, 'Loading...'));
  }

  return React.createElement(React.Fragment, {}, props.children);
};

// Alternative approach: Animation interrupt handler
export const useAnimationInterruptHandler = () => {
  const currentAnimationRef = useRef<Promise<void> | null>(null);
  const animationQueueRef = useRef<Array<() => void>>([]);
  
  // Function to interrupt current animation if a new one is requested
  const interruptAndQueue = (newAnimation: () => void) => {
    // If there's a current animation in progress, add the new one to the queue
    if (currentAnimationRef.current) {
      animationQueueRef.current.push(newAnimation);
    } else {
      // If no current animation, run the new one immediately
      newAnimation();
    }
  };
  
  // Function to process the animation queue
  const processQueue = async () => {
    if (animationQueueRef.current.length > 0) {
      const nextAnimation = animationQueueRef.current.shift();
      if (nextAnimation) {
        // Run the next animation
        nextAnimation();
      }
    }
  };
  
  return {
    interruptAndQueue,
    processQueue,
  };
};

// Utility function to safely toggle theme with animation protection
export const safeThemeToggle = (
  currentTheme: 'light' | 'dark', 
  onThemeChange: (theme: 'light' | 'dark') => void,
  setIsAnimating: (animating: boolean) => void
) => {
  // Check if an animation is already in progress
  if (getComputedStyle(document.documentElement).getPropertyValue('--is-animating') === 'true') {
    // If animating, delay the theme change until animation completes
    const animationEndHandler = () => {
      onThemeChange(currentTheme === 'light' ? 'dark' : 'light');
      setIsAnimating(false);
      document.documentElement.removeEventListener('transitionend', animationEndHandler);
    };
    
    document.documentElement.addEventListener('transitionend', animationEndHandler);
  } else {
    // If not animating, proceed with theme change
    setIsAnimating(true);
    onThemeChange(currentTheme === 'light' ? 'dark' : 'light');
    
    // Set a timeout to reset the animating state if transitionend doesn't fire
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Match the transition duration
  }
};

// Example usage in a component
export const ThemeToggleWithProtection = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAnimating, setIsAnimating] = useState(false);
  const { startThemeSwitch, completeThemeSwitch } = useRapidThemeSwitchingProtection();

  const handleThemeToggle = () => {
    startThemeSwitch();

    // Use the safe toggle function
    safeThemeToggle(theme, (newTheme) => {
      setTheme(newTheme);
      completeThemeSwitch();
    }, setIsAnimating);
  };

  return React.createElement(
    ThemeAnimationGuard,
    {
      fallback: React.createElement('div', {}, 'Switching theme...'),
      children: React.createElement(
        'button',
        {
          onClick: handleThemeToggle,
          disabled: isAnimating
        },
        `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`
      )
    }
  );
};