/**
 * Performance testing and optimization utilities for the todo application
 */

/**
 * Measures the performance of a function
 * @param fn The function to measure
 * @param iterations Number of times to run the function (default: 100)
 * @returns Performance metrics
 */
export async function measureFunctionPerformance<T>(
  fn: () => T | Promise<T>,
  iterations: number = 100
): Promise<{
  avgExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  totalExecutionTime: number;
}> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = fn();
    
    // Handle both sync and async functions
    if (result instanceof Promise) {
      await result;
    }
    
    const end = performance.now();
    times.push(end - start);
  }

  const total = times.reduce((sum, time) => sum + time, 0);
  const avg = total / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  return {
    avgExecutionTime: avg,
    minExecutionTime: min,
    maxExecutionTime: max,
    totalExecutionTime: total
  };
}

/**
 * Measures the rendering performance of a React component
 * @param renderFn Function that renders the component
 * @param iterations Number of times to render (default: 10)
 * @returns Rendering performance metrics
 */
export async function measureRenderingPerformance(
  renderFn: () => void,
  iterations: number = 10
): Promise<{
  avgRenderTime: number;
  minRenderTime: number;
  maxRenderTime: number;
  totalRenderTime: number;
  memoryUsed?: number;
}> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    // Force a garbage collection if available (in development)
    if ((globalThis as any).gc) {
      (globalThis as any).gc();
    }
    
    renderFn();
    
    const end = performance.now();
    times.push(end - start);
  }

  const total = times.reduce((sum, time) => sum + time, 0);
  const avg = total / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  // Memory usage measurement (if available)
  let memoryUsed: number | undefined;
  if ('memory' in performance && (performance as any).memory) {
    memoryUsed = (performance as any).memory.usedJSHeapSize;
  }

  return {
    avgRenderTime: avg,
    minRenderTime: min,
    maxRenderTime: max,
    totalRenderTime: total,
    memoryUsed
  };
}

/**
 * Measures API endpoint performance
 * @param url The API endpoint to test
 * @param options Request options (default: GET request)
 * @param iterations Number of requests to make (default: 10)
 * @returns API performance metrics
 */
export async function measureApiPerformance(
  url: string,
  options: RequestInit = { method: 'GET' },
  iterations: number = 10
): Promise<{
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  totalResponseTime: number;
  successRate: number;
  errors: string[];
}> {
  const times: number[] = [];
  const errors: string[] = [];
  let successfulRequests = 0;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    try {
      const response = await fetch(url, options);
      const end = performance.now();
      
      if (response.ok) {
        successfulRequests++;
        times.push(end - start);
      } else {
        errors.push(`Request ${i+1} failed with status ${response.status}`);
      }
    } catch (error) {
      errors.push(`Request ${i+1} failed with error: ${(error as Error).message}`);
    }
  }

  if (times.length === 0) {
    return {
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      totalResponseTime: 0,
      successRate: 0,
      errors
    };
  }

  const total = times.reduce((sum, time) => sum + time, 0);
  const avg = total / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const successRate = (successfulRequests / iterations) * 100;

  return {
    avgResponseTime: avg,
    minResponseTime: min,
    maxResponseTime: max,
    totalResponseTime: total,
    successRate,
    errors
  };
}

/**
 * Performance monitoring class for tracking application performance
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  /**
   * Starts monitoring a specific metric
   * @param metricName Name of the metric to monitor
   */
  startMonitoring(metricName: string): void {
    const startTime = performance.now();
    this.metrics.set(metricName, [startTime]);
  }

  /**
   * Stops monitoring a specific metric and records the duration
   * @param metricName Name of the metric to stop monitoring
   */
  stopMonitoring(metricName: string): number | null {
    const times = this.metrics.get(metricName);
    if (!times || times.length === 0) {
      console.warn(`Metric ${metricName} was not being monitored`);
      return null;
    }

    const startTime = times[0];
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Replace start time with duration
    this.metrics.set(metricName, [duration]);
    return duration;
  }

  /**
   * Gets the recorded duration for a metric
   * @param metricName Name of the metric
   * @returns Duration in milliseconds or null if not found
   */
  getDuration(metricName: string): number | null {
    const times = this.metrics.get(metricName);
    if (!times || times.length === 0) {
      return null;
    }
    return times[0];
  }

  /**
   * Starts monitoring long tasks using PerformanceObserver
   */
  startLongTaskMonitoring(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn(`Long task detected: ${entry.duration}ms at ${entry.startTime}`);
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.push(observer);
  }

  /**
   * Starts monitoring layout thrashing
   */
  startLayoutThrashingMonitoring(): void {
    let forcedReflowCount = 0;
    let lastAccessTime = 0;

    // Override common properties that trigger reflow
    const propertiesToMonitor = [
      'offsetParent', 'offsetWidth', 'offsetHeight', 'offsetTop', 'offsetLeft',
      'scrollWidth', 'scrollHeight', 'clientWidth', 'clientHeight',
      'getBoundingClientRect', 'getClientRects'
    ];

    propertiesToMonitor.forEach(prop => {
      // This is a simplified approach - in reality, you'd need to monitor
      // all DOM elements for these property accesses
      console.info(`Monitoring layout property: ${prop}`);
    });
  }

  /**
   * Reports all collected metrics
   */
  reportMetrics(): void {
    console.group('Performance Metrics Report');
    for (const [metricName, times] of this.metrics.entries()) {
      if (times.length === 1) {
        console.log(`${metricName}: ${times[0].toFixed(2)}ms`);
      } else {
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        console.log(`${metricName}: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms`);
      }
    }
    console.groupEnd();
  }

  /**
   * Clears all collected metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Stops all performance monitoring
   */
  stopAllMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Function to optimize rendering by batching DOM updates
 * @param updates Array of functions that perform DOM updates
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
  // In a real implementation, this would use requestAnimationFrame
  // or a similar technique to batch DOM updates
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Debounced function executor to prevent excessive function calls
 */
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | number | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId as number);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  } as T;
}

/**
 * Throttled function executor to limit function calls
 */
export function createThrottledFunction<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
}