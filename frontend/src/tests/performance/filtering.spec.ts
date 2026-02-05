import { renderHook } from '@testing-library/react';
import { useTasks } from '@/src/hooks/useTasks';
import { Task } from '@/lib/types';

// Mock large dataset for performance testing
const generateLargeTaskDataset = (taskCount: number, tagCount: number): Task[] => {
  const tasks: Task[] = [];
  const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  const statuses: Array<'active' | 'completed'> = ['active', 'completed'];
  
  // Generate tags
  const tags = Array.from({ length: tagCount }, (_, i) => ({
    id: i + 1,
    name: `Tag ${i + 1}`,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    userId: 1,
    createdAt: new Date(),
  }));

  for (let i = 0; i < taskCount; i++) {
    tasks.push({
      id: i + 1,
      title: `Task ${i + 1}`,
      description: `Description for task ${i + 1}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within 30 days
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000), // Random date within a year ago
      updatedAt: new Date(),
      userId: 1,
      tags: tags.slice(0, Math.min(5, Math.floor(Math.random() * 6))), // Assign 0-5 random tags
      recurrencePattern: Math.random() > 0.7 ? {  // 30% chance of recurrence
        id: i + 1,
        patternType: ['daily', 'weekly', 'monthly', 'yearly'][Math.floor(Math.random() * 4)] as any,
        interval: Math.floor(Math.random() * 5) + 1,
        endCondition: ['never', 'after_occurrences', 'on_date'][Math.floor(Math.random() * 3)] as any,
        occurrenceCount: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : undefined,
        endDate: Math.random() > 0.5 ? new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : undefined,
        daysOfWeek: Math.random() > 0.5 ? ['mon', 'wed', 'fri'] : undefined,
        daysOfMonth: Math.random() > 0.5 ? [1, 15] : undefined,
        createdAt: new Date(),
      } : undefined,
      reminders: Math.random() > 0.6 ? [{  // 40% chance of having reminders
        id: i + 1,
        taskId: i + 1,
        scheduledTime: new Date(Date.now() + Math.floor(Math.random() * 24) * 60 * 60 * 1000), // Random time within 24 hours
        deliveryStatus: ['pending', 'sent', 'delivered', 'failed'][Math.floor(Math.random() * 4)] as any,
        createdAt: new Date(),
      }] : [],
    });
  }

  return tasks;
};

describe('Performance: Task Filtering with Large Datasets', () => {
  const LARGE_TASK_COUNT = 1000;
  const TAG_COUNT = 50;
  const DATASET = generateLargeTaskDataset(LARGE_TASK_COUNT, TAG_COUNT);

  test('should filter tasks by tags efficiently with 1000+ tasks and 50+ tags', () => {
    const { result } = renderHook(() => useTasks());
    
    // Initialize with large dataset
    result.current.initializeTasks(DATASET);
    
    // Measure performance of tag filtering
    const start = performance.now();
    const filteredTasks = result.current.filterTasksByTagIds([1, 5, 10, 15, 20]);
    const end = performance.now();
    
    const executionTime = end - start;
    
    // Expect filtering to complete in under 500ms
    expect(executionTime).toBeLessThan(500);
    expect(filteredTasks.length).toBeGreaterThanOrEqual(0);
    expect(filteredTasks.length).toBeLessThanOrEqual(LARGE_TASK_COUNT);
    
    console.log(`Tag filtering performance: ${executionTime.toFixed(2)}ms for ${LARGE_TASK_COUNT} tasks and ${TAG_COUNT} tags`);
  });

  test('should filter tasks by recurrence efficiently with 1000+ tasks', () => {
    const { result } = renderHook(() => useTasks());
    
    // Initialize with large dataset
    result.current.initializeTasks(DATASET);
    
    // Measure performance of recurrence filtering
    const start = performance.now();
    const filteredTasks = result.current.filterTasksByRecurrenceType('weekly');
    const end = performance.now();
    
    const executionTime = end - start;
    
    // Expect filtering to complete in under 500ms
    expect(executionTime).toBeLessThan(500);
    expect(filteredTasks.length).toBeGreaterThanOrEqual(0);
    expect(filteredTasks.length).toBeLessThanOrEqual(LARGE_TASK_COUNT);
    
    console.log(`Recurrence filtering performance: ${executionTime.toFixed(2)}ms for ${LARGE_TASK_COUNT} tasks`);
  });

  test('should filter tasks by reminder status efficiently with 1000+ tasks', () => {
    const { result } = renderHook(() => useTasks());
    
    // Initialize with large dataset
    result.current.initializeTasks(DATASET);
    
    // Measure performance of reminder status filtering
    const start = performance.now();
    const filteredTasks = result.current.filterTasksByReminderStatus('pending');
    const end = performance.now();
    
    const executionTime = end - start;
    
    // Expect filtering to complete in under 500ms
    expect(executionTime).toBeLessThan(500);
    expect(filteredTasks.length).toBeGreaterThanOrEqual(0);
    expect(filteredTasks.length).toBeLessThanOrEqual(LARGE_TASK_COUNT);
    
    console.log(`Reminder status filtering performance: ${executionTime.toFixed(2)}ms for ${LARGE_TASK_COUNT} tasks`);
  });

  test('should perform advanced filtering efficiently with 1000+ tasks and 50+ tags', () => {
    const { result } = renderHook(() => useTasks());
    
    // Initialize with large dataset
    result.current.initializeTasks(DATASET);
    
    // Measure performance of advanced filtering
    const start = performance.now();
    const filteredTasks = result.current.filterTasksAdvanced({
      status: 'active',
      priority: 'high',
      tagIds: [1, 5, 10, 15, 20],
      hasRecurrence: true,
      hasReminders: true,
      searchQuery: 'Task',
    });
    const end = performance.now();
    
    const executionTime = end - start;
    
    // Expect filtering to complete in under 1000ms
    expect(executionTime).toBeLessThan(1000);
    expect(filteredTasks.length).toBeGreaterThanOrEqual(0);
    expect(filteredTasks.length).toBeLessThanOrEqual(LARGE_TASK_COUNT);
    
    console.log(`Advanced filtering performance: ${executionTime.toFixed(2)}ms for ${LARGE_TASK_COUNT} tasks and ${TAG_COUNT} tags`);
  });

  test('should search tasks by tags and metadata efficiently with 1000+ tasks', () => {
    const { result } = renderHook(() => useTasks());
    
    // Initialize with large dataset
    result.current.initializeTasks(DATASET);
    
    // Measure performance of search functionality
    const start = performance.now();
    const filteredTasks = result.current.filterTasksAdvanced({
      searchQuery: 'Tag 5',
    });
    const end = performance.now();
    
    const executionTime = end - start;
    
    // Expect search to complete in under 1000ms
    expect(executionTime).toBeLessThan(1000);
    expect(filteredTasks.length).toBeGreaterThanOrEqual(0);
    expect(filteredTasks.length).toBeLessThanOrEqual(LARGE_TASK_COUNT);
    
    console.log(`Search performance: ${executionTime.toFixed(2)}ms for ${LARGE_TASK_COUNT} tasks`);
  });

  test('should sort tasks efficiently with 1000+ tasks', () => {
    const { result } = renderHook(() => useTasks());
    
    // Initialize with large dataset
    result.current.initializeTasks(DATASET);
    
    // Measure performance of sorting
    const start = performance.now();
    const sortedTasks = result.current.sortTasks(DATASET, 'dueDate', 'asc');
    const end = performance.now();
    
    const executionTime = end - start;
    
    // Expect sorting to complete in under 500ms
    expect(executionTime).toBeLessThan(500);
    expect(sortedTasks.length).toBe(LARGE_TASK_COUNT);
    
    console.log(`Sorting performance: ${executionTime.toFixed(2)}ms for ${LARGE_TASK_COUNT} tasks`);
  });
});