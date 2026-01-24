// Utility to test performance improvements and measure re-render frequency
import { useState, useEffect, useRef } from 'react';

// Performance monitoring utility
export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const renderTimesRef = useRef<number[]>([]);

  // Track renders
  useEffect(() => {
    renderCountRef.current += 1;
    
    // Track render time
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
    }
    
    const renderTime = performance.now();
    renderTimesRef.current.push(renderTime);
    
    // Log performance metrics periodically
    if (renderCountRef.current % 10 === 0) {
      console.group(`Performance Metrics for ${componentName}`);
      console.log(`Render count: ${renderCountRef.current}`);
      
      if (renderTimesRef.current.length > 1) {
        const timeDeltas = renderTimesRef.current
          .slice(1)
          .map((time, i) => time - renderTimesRef.current[i]);
        
        const avgRenderTime = timeDeltas.reduce((a, b) => a + b, 0) / timeDeltas.length;
        console.log(`Average render time: ${avgRenderTime.toFixed(2)}ms`);
      }
      
      console.groupEnd();
    }
  });

  // Function to get current metrics
  const getMetrics = () => ({
    renderCount: renderCountRef.current,
    totalTime: startTimeRef.current ? performance.now() - startTimeRef.current : 0,
    averageRenderTime: renderTimesRef.current.length > 1 
      ? renderTimesRef.current
          .slice(1)
          .map((time, i) => time - renderTimesRef.current[i])
          .reduce((a, b) => a + b, 0) / (renderTimesRef.current.length - 1)
      : 0,
  });

  return { getMetrics };
};

// Hook to measure re-render frequency
export const useRenderFrequency = (componentName: string) => {
  const [renderCount, setRenderCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frequencyRef = useRef(0); // renders per second

  // Increment render count on each render
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // Calculate render frequency every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Calculate frequency as renders per second
      frequencyRef.current = renderCount;
      console.log(`${componentName} render frequency: ${frequencyRef.current} renders/sec`);
      
      // Reset counter for next measurement
      setRenderCount(0);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [componentName]);

  return frequencyRef.current;
};

// Hook to monitor component performance
export const useComponentPerformance = (componentName: string) => {
  const startTime = useRef(performance.now());
  const [renderDuration, setRenderDuration] = useState(0);

  // Measure render duration
  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    setRenderDuration(duration);
    
    // Log if render takes too long (potential performance issue)
    if (duration > 16.67) { // More than one frame at 60fps
      console.warn(`${componentName} took ${duration.toFixed(2)}ms to render (potential performance issue)`);
    }
    
    // Reset start time for next render
    startTime.current = performance.now();
  });

  return { renderDuration };
};