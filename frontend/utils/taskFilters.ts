import { Task } from '@/types';

export interface TaskFilters {
  status: 'all' | 'active' | 'completed';
  priority: 'all' | 'low' | 'medium' | 'high';
  tag: string | 'all';
  search?: string;
  sortBy?: 'title' | 'priority' | 'dueDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter and sort tasks based on provided filters
 */
export const filterAndSortTasks = (
  tasks: Task[],
  filters: TaskFilters
): Task[] => {
  let filtered = [...tasks];

  // Filter by status
  if (filters.status === 'active') {
    filtered = filtered.filter(task => !task.completed);
  } else if (filters.status === 'completed') {
    filtered = filtered.filter(task => task.completed);
  }

  // Filter by priority
  if (filters.priority !== 'all') {
    filtered = filtered.filter(task => task.priority === filters.priority);
  }

  // Filter by tag (using tag ID)
  if (filters.tag !== 'all') {
    filtered = filtered.filter(task => 
      task.tags && task.tags.includes(filters.tag)
    );
  }

  // Filter by search term
  if (filters.search && filters.search.trim()) {
    const searchLower = filters.search.toLowerCase().trim();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower))
    );
  }

  // Sort tasks
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  return filtered;
};

/**
 * Hook to filter and sort tasks with Redux integration
 */
import { useAppSelector } from '@/redux/hooks';
import { useMemo } from 'react';

export const useFilteredTasks = (additionalFilters: Partial<TaskFilters> = {}) => {
  const { tasks, filters } = useAppSelector(state => state.tasks);

  return useMemo(() => {
    const combinedFilters: TaskFilters = {
      status: filters.status || 'all',
      priority: filters.priority || 'all',
      tag: filters.tag || 'all',
      search: filters.search || additionalFilters.search || '',
      sortBy: filters.sortBy || additionalFilters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || additionalFilters.sortOrder || 'desc',
    };

    return filterAndSortTasks(tasks || [], combinedFilters);
  }, [tasks, filters, additionalFilters]);
};
