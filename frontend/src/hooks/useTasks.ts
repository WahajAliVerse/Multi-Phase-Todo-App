import { useState, useEffect, useCallback } from 'react';
import { Task, Tag, RecurrencePattern, Reminder } from '@/src/lib/types';

// Custom hook for managing tasks with advanced filtering
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize tasks
  const initializeTasks = useCallback((initialTasks: Task[]) => {
    setTasks(initialTasks);
  }, []);

  // Add a new task
  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  // Update an existing task
  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  }, []);

  // Remove a task
  const removeTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  // Find a task by ID
  const findTaskById = useCallback((id: number): Task | undefined => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  // Filter tasks by status
  const filterTasksByStatus = useCallback((status: 'active' | 'completed' | 'all'): Task[] => {
    if (status === 'all') return tasks;
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  // Filter tasks by priority
  const filterTasksByPriority = useCallback((priority: 'low' | 'medium' | 'high' | 'all'): Task[] => {
    if (priority === 'all') return tasks;
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  // Filter tasks by tags
  const filterTasksByTags = useCallback((tagIds: number[]): Task[] => {
    if (tagIds.length === 0) return tasks;
    
    return tasks.filter(task => {
      if (!task.tags || task.tags.length === 0) return false;
      return task.tags.some(tag => tagIds.includes(tag.id));
    });
  }, [tasks]);

  // Filter tasks by recurrence pattern
  const filterTasksByRecurrence = useCallback((hasRecurrence: boolean): Task[] => {
    return tasks.filter(task => !!task.recurrencePattern === hasRecurrence);
  }, [tasks]);

  // Filter tasks by reminders
  const filterTasksByReminders = useCallback((hasReminders: boolean): Task[] => {
    return tasks.filter(task => {
      if (!hasReminders) {
        return !task.reminders || task.reminders.length === 0;
      }
      return task.reminders && task.reminders.length > 0;
    });
  }, [tasks]);

  // Filter tasks by due date range
  const filterTasksByDueDateRange = useCallback((startDate?: Date, endDate?: Date): Task[] => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      
      if (startDate && taskDate < startDate) return false;
      if (endDate && taskDate > endDate) return false;
      
      return true;
    });
  }, [tasks]);

  // Filter tasks by multiple criteria
  const filterTasksAdvanced = useCallback((criteria: {
    status?: 'active' | 'completed' | 'all';
    priority?: 'low' | 'medium' | 'high' | 'all';
    tagIds?: number[];
    hasRecurrence?: boolean;
    hasReminders?: boolean;
    startDate?: Date;
    endDate?: Date;
    searchQuery?: string;
  }): Task[] => {
    let filteredTasks = [...tasks];

    // Apply status filter
    if (criteria.status && criteria.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === criteria.status);
    }

    // Apply priority filter
    if (criteria.priority && criteria.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === criteria.priority);
    }

    // Apply tags filter
    if (criteria.tagIds && criteria.tagIds.length > 0) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.tags || task.tags.length === 0) return false;
        return task.tags.some(tag => criteria.tagIds?.includes(tag.id));
      });
    }

    // Apply recurrence filter
    if (criteria.hasRecurrence !== undefined) {
      filteredTasks = filteredTasks.filter(task => !!task.recurrencePattern === criteria.hasRecurrence);
    }

    // Apply reminders filter
    if (criteria.hasReminders !== undefined) {
      filteredTasks = filteredTasks.filter(task => {
        if (!criteria.hasReminders) {
          return !task.reminders || task.reminders.length === 0;
        }
        return task.reminders && task.reminders.length > 0;
      });
    }

    // Apply date range filter
    if (criteria.startDate || criteria.endDate) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        
        const taskDate = new Date(task.dueDate);
        
        if (criteria.startDate && taskDate < criteria.startDate) return false;
        if (criteria.endDate && taskDate > criteria.endDate) return false;
        
        return true;
      });
    }

    // Apply search query filter
    if (criteria.searchQuery) {
      const query = criteria.searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        task.tags.some(tag => tag.name.toLowerCase().includes(query))
      );
    }

    return filteredTasks;
  }, [tasks]);

  // Get tasks with upcoming due dates
  const getTasksWithUpcomingDueDates = useCallback((days: number): Task[] => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= futureDate;
    });
  }, [tasks]);

  // Get tasks with overdue dates
  const getOverdueTasks = useCallback((): Task[] => {
    const now = new Date();
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      
      const dueDate = new Date(task.dueDate);
      return dueDate < now;
    });
  }, [tasks]);

  // Get tasks with pending reminders
  const getTasksWithPendingReminders = useCallback((): Task[] => {
    return tasks.filter(task => {
      if (!task.reminders || task.reminders.length === 0) return false;
      
      return task.reminders.some(reminder => 
        reminder.deliveryStatus === 'pending' && 
        new Date(reminder.scheduledTime) <= new Date()
      );
    });
  }, [tasks]);

  // Sort tasks by various criteria
  const sortTasks = useCallback((tasksToSort: Task[], sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt' | 'updatedAt', order: 'asc' | 'desc' = 'asc'): Task[] => {
    return [...tasksToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'priority':
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = (a.updatedAt ? new Date(a.updatedAt).getTime() : 0) - (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }, []);

  // Get statistics about tasks
  const getTaskStats = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const active = total - completed;
    const withTags = tasks.filter(t => t.tags && t.tags.length > 0).length;
    const withRecurrence = tasks.filter(t => t.recurrencePattern).length;
    const withReminders = tasks.filter(t => t.reminders && t.reminders.length > 0).length;
    const overdue = getOverdueTasks().length;

    return {
      total,
      completed,
      active,
      withTags,
      withRecurrence,
      withReminders,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks, getOverdueTasks]);

  return {
    tasks,
    loading,
    error,
    initializeTasks,
    addTask,
    updateTask,
    removeTask,
    findTaskById,
    filterTasksByStatus,
    filterTasksByPriority,
    filterTasksByTags,
    filterTasksByRecurrence,
    filterTasksByReminders,
    filterTasksByDueDateRange,
    filterTasksAdvanced,
    getTasksWithUpcomingDueDates,
    getOverdueTasks,
    getTasksWithPendingReminders,
    sortTasks,
    getTaskStats,
  };
};