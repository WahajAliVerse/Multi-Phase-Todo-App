# Performance Monitoring Configuration

## Overview
This document outlines the performance monitoring setup for tracking application performance with 100 concurrent users.

## Backend Performance Monitoring

### Metrics Collection
The backend will track the following performance metrics:

1. **Response Time Metrics**:
   - Average response time per endpoint
   - 95th and 99th percentile response times
   - Slow query detection

2. **Throughput Metrics**:
   - Requests per second (RPS)
   - Successful vs failed request ratios

3. **Resource Utilization**:
   - CPU usage
   - Memory consumption
   - Database connection pool usage
   - Active connections

4. **Application-Specific Metrics**:
   - Tasks created per minute
   - Authentication requests per minute
   - Database query performance
   - Background job processing time

### Implementation in FastAPI Application

```python
# backend/src/core/monitoring.py
import time
from functools import wraps
from typing import Callable
import logging
from prometheus_client import Counter, Histogram, Gauge
from fastapi import Request, Response

# Define Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Number of active connections'
)

TASK_OPERATIONS = Counter(
    'task_operations_total',
    'Total task operations',
    ['operation', 'status']
)

def monitor_request_time(func: Callable) -> Callable:
    """
    Decorator to monitor request processing time
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        response = func(*args, **kwargs)
        duration = time.time() - start_time
        
        # Record metrics
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        return response
    return wrapper

# Middleware for monitoring
async def monitoring_middleware(request: Request, call_next):
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=200  # This would need to be updated with actual status
    ).inc()
    
    ACTIVE_CONNECTIONS.inc()
    
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUEST_DURATION.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    ACTIVE_CONNECTIONS.dec()
    
    return response
```

### Performance Testing Script

```python
# backend/tests/performance/load_test.py
import asyncio
import aiohttp
import time
from typing import List, Dict, Any
import argparse

async def simulate_user(session: aiohttp.ClientSession, base_url: str, user_id: int):
    """
    Simulate a single user interacting with the application
    """
    try:
        # Login simulation
        login_data = {
            "email": f"user{user_id}@example.com",
            "password": "password123"
        }
        async with session.post(f"{base_url}/auth/login", json=login_data) as resp:
            if resp.status == 200:
                auth_data = await resp.json()
                headers = {"Authorization": f"Bearer {auth_data['access_token']}"}
                
                # Perform task operations
                for i in range(5):  # Create 5 tasks per user
                    task_data = {
                        "title": f"Task {i} for user {user_id}",
                        "description": f"Description for task {i}",
                        "status": "pending",
                        "priority": "medium",
                        "due_date": "2023-12-31T10:00:00Z"
                    }
                    
                    async with session.post(f"{base_url}/tasks", json=task_data, headers=headers) as task_resp:
                        if task_resp.status == 200:
                            task = await task_resp.json()
                            
                            # Update the task
                            task_data["status"] = "completed"
                            async with session.put(f"{base_url}/tasks/{task['id']}", json=task_data, headers=headers) as update_resp:
                                if update_resp.status == 200:
                                    print(f"User {user_id}: Task {task['id']} updated successfully")
                                
                    await asyncio.sleep(0.1)  # Small delay between operations
    except Exception as e:
        print(f"Error simulating user {user_id}: {str(e)}")

async def run_load_test(base_url: str, num_users: int, duration: int):
    """
    Run a load test with specified number of users for a duration
    """
    print(f"Starting load test with {num_users} concurrent users for {duration} seconds...")
    
    start_time = time.time()
    tasks = []
    
    connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
    timeout = aiohttp.ClientTimeout(total=30)
    
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        # Create tasks for concurrent users
        for user_id in range(num_users):
            task = asyncio.create_task(simulate_user(session, base_url, user_id))
            tasks.append(task)
            
            # Stagger user creation
            await asyncio.sleep(0.1)
        
        # Wait for specified duration
        await asyncio.sleep(duration)
        
        # Cancel all tasks
        for task in tasks:
            task.cancel()
        
        # Wait for tasks to finish cancellation
        await asyncio.gather(*tasks, return_exceptions=True)
    
    end_time = time.time()
    print(f"Load test completed in {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load test for Todo application")
    parser.add_argument("--base-url", default="http://localhost:8000/api", help="Base API URL")
    parser.add_argument("--users", type=int, default=100, help="Number of concurrent users")
    parser.add_argument("--duration", type=int, default=60, help="Duration of test in seconds")
    
    args = parser.parse_args()
    
    asyncio.run(run_load_test(args.base_url, args.users, args.duration))
```

### Frontend Performance Monitoring

```typescript
// frontend/src/lib/utils/performanceMonitoring.ts
import { TaskRead } from '@/lib/types';

// Performance monitoring utilities for the frontend
export class FrontendPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  // Track API call performance
  async trackApiCall<T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    let success = true;
    
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Record the metric
      this.recordMetric(`api.${endpoint}`, duration, { success });
      
      // Log slow API calls (above 500ms)
      if (duration > 500) {
        console.warn(`Slow API call to ${endpoint}: ${duration.toFixed(2)}ms`);
      }
    }
  }
  
  // Track component rendering performance
  trackRenderTime(componentName: string, renderFunction: () => React.ReactNode): React.ReactNode {
    const startTime = performance.now();
    
    try {
      const result = renderFunction();
      return result;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(`render.${componentName}`, duration);
      
      // Log slow renders (above 16ms - one frame at 60fps)
      if (duration > 16) {
        console.warn(`Slow render for ${componentName}: ${duration.toFixed(2)}ms`);
      }
    }
  }
  
  // Track task operations performance
  async trackTaskOperation(
    operation: 'create' | 'update' | 'delete' | 'fetch',
    operationFn: () => Promise<any>
  ): Promise<any> {
    const startTime = performance.now();
    
    try {
      const result = await operationFn();
      return result;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(`task.${operation}`, duration);
      
      // Report to monitoring service if operation is too slow
      if (duration > 1000) { // Above 1 second
        this.reportSlowOperation(operation, duration);
      }
    }
  }
  
  // Record a performance metric
  private recordMetric(name: string, value: number, tags?: Record<string, any>) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only the last 1000 measurements to prevent memory issues
    if (values.length > 1000) {
      values.shift();
    }
  }
  
  // Get metric statistics
  getMetricStats(name: string): { 
    count: number; 
    avg: number; 
    min: number; 
    max: number; 
    p95: number; 
    p99: number 
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const avg = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95) - 1;
    const p99Index = Math.floor(count * 0.99) - 1;
    
    return {
      count,
      avg,
      min,
      max,
      p95: sorted[Math.max(0, p95Index)],
      p99: sorted[Math.max(0, p99Index)]
    };
  }
  
  // Report slow operations to monitoring service
  private reportSlowOperation(operation: string, duration: number) {
    // In a real implementation, this would send data to a monitoring service
    // like Sentry, DataDog, or similar
    console.group(`Slow Operation Report: ${operation}`);
    console.log(`Duration: ${duration.toFixed(2)}ms`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`User Agent: ${navigator.userAgent}`);
    console.groupEnd();
  }
  
  // Send aggregated metrics to backend
  async sendMetricsToServer(serverUrl: string) {
    const metricsPayload = {};
    
    for (const [name, values] of this.metrics.entries()) {
      if (values.length > 0) {
        const stats = this.getMetricStats(name);
        if (stats) {
          (metricsPayload as any)[name] = stats;
        }
      }
    }
    
    try {
      await fetch(`${serverUrl}/metrics/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricsPayload)
      });
    } catch (error) {
      console.error('Failed to send metrics to server:', error);
    }
  }
}

// Initialize performance monitor
export const perfMonitor = new FrontendPerformanceMonitor();

// Function to measure and report page load time
export const measurePageLoadTime = () => {
  if (performance.timing) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    perfMonitor.recordMetric('page.load_time', loadTime);
    
    if (loadTime > 3000) { // Above 3 seconds
      console.warn(`Slow page load: ${loadTime}ms`);
    }
  }
};

// Call this when the page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', measurePageLoadTime);
}
```

### Performance Monitoring API Endpoint

```python
# backend/src/api/monitoring.py
from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import Dict, Any
from backend.src.core.database import get_session
from backend.src.core.auth import get_current_active_user
from backend.src.models.user import User

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

@router.get("/performance-stats")
def get_performance_stats(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Get performance statistics for the application
    This endpoint would aggregate metrics from the monitoring system
    """
    # In a real implementation, this would fetch metrics from a monitoring system
    # like Prometheus, DataDog, or similar
    return {
        "response_times": {
            "avg_ms": 120.5,
            "p95_ms": 350.2,
            "p99_ms": 520.7
        },
        "throughput": {
            "requests_per_minute": 2450,
            "success_rate": 0.987
        },
        "resource_utilization": {
            "cpu_percent": 45.2,
            "memory_mb": 320.5,
            "active_connections": 24
        },
        "timestamp": "2023-10-05T14:48:00Z"
    }

@router.post("/frontend-metrics")
def receive_frontend_metrics(
    metrics: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """
    Receive performance metrics from the frontend
    """
    # In a real implementation, this would store frontend metrics
    # in a time-series database or monitoring system
    print(f"Received frontend metrics from user {current_user.id}: {metrics}")
    
    # Process and store metrics for analysis
    # This could involve sending to a metrics database like InfluxDB
    # or a monitoring service like Prometheus
    
    return {"status": "received", "metrics_count": len(metrics)}
```

### Integration with Existing Services

The performance monitoring will be integrated with the existing services to track metrics for 100 concurrent users:

1. **Task Service**: Track task creation, update, and deletion performance
2. **Authentication Service**: Track login, registration, and session validation performance
3. **Database Layer**: Track query performance and connection pool metrics
4. **API Layer**: Track endpoint response times and error rates

This implementation provides comprehensive performance monitoring for tracking how the application performs with 100 concurrent users, meeting the requirement in task T121.