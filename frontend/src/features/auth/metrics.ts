// Metrics collection for authentication and user registration

// Define metric types
export interface Metric {
  name: string;
  value: number | string | boolean;
  timestamp: Date;
  tags?: Record<string, string>;
}

// Define registration metrics
export interface RegistrationMetric extends Metric {
  name: 'registration.duration' | 'registration.success' | 'registration.failure';
  value: number; // duration in ms or success/failure count
}

// Define task creation metrics
export interface TaskCreationMetric extends Metric {
  name: 'task.creation.duration' | 'task.creation.success' | 'task.creation.failure';
  value: number;
}

// Storage for metrics (in a real app, this would likely be sent to a metrics service)
const metricsStorage: Metric[] = [];

// Performance observer for measuring durations
let performanceObserver: PerformanceObserver | null = null;

// Initialize metrics collection
export const initializeMetrics = () => {
  // Set up performance observer to capture navigation and resource timings
  if (typeof PerformanceObserver !== 'undefined') {
    performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          recordMetric({
            name: entry.name,
            value: entry.duration,
            timestamp: new Date(entry.startTime + entry.duration),
            tags: { type: entry.entryType }
          });
        }
      });
    });
    
    performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
  }
};

// Record a metric
export const recordMetric = (metric: Metric) => {
  metricsStorage.push(metric);
  
  // In a real application, you would send this to a metrics service
  console.debug('Metric recorded:', metric);
  
  // Optional: batch and send metrics to a service
  // sendToMetricsService([metric]);
};

// Measure a function's execution time
export const measureFunction = async <T>(
  fn: () => Promise<T>,
  metricName: string,
  tags?: Record<string, string>
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric({
      name: metricName,
      value: duration,
      timestamp: new Date(),
      tags: { ...tags, status: 'success' }
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recordMetric({
      name: metricName,
      value: duration,
      timestamp: new Date(),
      tags: { ...tags, status: 'error', error: (error as Error).message }
    });
    
    throw error;
  }
};

// Measure registration duration
export const measureRegistrationDuration = async <T>(
  registrationFn: () => Promise<T>
): Promise<T> => {
  return measureFunction(registrationFn, 'registration.duration');
};

// Measure task creation duration
export const measureTaskCreationDuration = async <T>(
  taskCreationFn: () => Promise<T>
): Promise<T> => {
  return measureFunction(taskCreationFn, 'task.creation.duration');
};

// Record registration success
export const recordRegistrationSuccess = (userId: number) => {
  recordMetric({
    name: 'registration.success',
    value: 1,
    timestamp: new Date(),
    tags: { userId: userId.toString() }
  });
};

// Record registration failure
export const recordRegistrationFailure = (error: string, errorType?: string) => {
  recordMetric({
    name: 'registration.failure',
    value: 1,
    timestamp: new Date(),
    tags: { error, errorType: errorType || 'unknown' }
  });
};

// Record task creation success
export const recordTaskCreationSuccess = (taskId: number) => {
  recordMetric({
    name: 'task.creation.success',
    value: 1,
    timestamp: new Date(),
    tags: { taskId: taskId.toString() }
  });
};

// Record task creation failure
export const recordTaskCreationFailure = (error: string, errorType?: string) => {
  recordMetric({
    name: 'task.creation.failure',
    value: 1,
    timestamp: new Date(),
    tags: { error, errorType: errorType || 'unknown' }
  });
};

// Get metrics for a specific name
export const getMetricsByName = (name: string): Metric[] => {
  return metricsStorage.filter(metric => metric.name === name);
};

// Get registration metrics
export const getRegistrationMetrics = (): RegistrationMetric[] => {
  return metricsStorage.filter(
    metric => metric.name.startsWith('registration.')
  ) as RegistrationMetric[];
};

// Get task creation metrics
export const getTaskCreationMetrics = (): TaskCreationMetric[] => {
  return metricsStorage.filter(
    metric => metric.name.startsWith('task.creation.')
  ) as TaskCreationMetric[];
};

// Calculate average duration for a metric
export const calculateAverageDuration = (name: string): number => {
  const metrics = getMetricsByName(name).filter(m => typeof m.value === 'number') as Metric[];
  if (metrics.length === 0) return 0;
  
  const sum = metrics.reduce((acc, metric) => acc + (metric.value as number), 0);
  return sum / metrics.length;
};

// Calculate success rate for registration
export const calculateRegistrationSuccessRate = (): number => {
  const successMetrics = getMetricsByName('registration.success');
  const failureMetrics = getMetricsByName('registration.failure');
  
  const total = successMetrics.length + failureMetrics.length;
  if (total === 0) return 0;
  
  return (successMetrics.length / total) * 100;
};

// Calculate success rate for task creation
export const calculateTaskCreationSuccessRate = (): number => {
  const successMetrics = getMetricsByName('task.creation.success');
  const failureMetrics = getMetricsByName('task.creation.failure');
  
  const total = successMetrics.length + failureMetrics.length;
  if (total === 0) return 0;
  
  return (successMetrics.length / total) * 100;
};

// Calculate registration completion time
export const calculateAvgRegistrationTime = (): number => {
  return calculateAverageDuration('registration.duration');
};

// Calculate task creation time
export const calculateAvgTaskCreationTime = (): number => {
  return calculateAverageDuration('task.creation.duration');
};

// Flush metrics to a service (in a real app)
export const flushMetrics = async () => {
  if (metricsStorage.length === 0) return;
  
  // In a real application, you would send metrics to a service
  // await sendToMetricsService(metricsStorage);
  
  // Clear local storage after sending
  metricsStorage.length = 0;
};

// Cleanup function to disconnect observers
export const cleanupMetrics = () => {
  if (performanceObserver) {
    performanceObserver.disconnect();
    performanceObserver = null;
  }
};

// Initialize metrics when module loads
initializeMetrics();

// Register cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupMetrics();
    flushMetrics();
  });
}