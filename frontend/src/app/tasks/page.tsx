'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchTasks, createTask, updateTask, deleteTask, toggleTaskComplete } from '@/store/slices/taskSlice';
import TaskCard from '@/components/TaskCard/TaskCard';
import TaskForm from '@/components/TaskForm/TaskForm';
import TaskFilters from '@/components/TaskFilters/TaskFilters';
import Navigation from '@/components/Navigation/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

const TasksPage = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all' as 'all' | 'active' | 'completed',
    priority: 'all' as 'all' | 'high' | 'medium' | 'low',
    sortBy: 'createdAt' as 'dueDate' | 'priority' | 'title' | 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    // Fetch tasks when component mounts
    dispatch(fetchTasks());
  }, [dispatch]);

  // Memoized filtered and sorted tasks
  const { activeTasks, completedTasks } = useMemo(() => {
    // Apply filters and sorting to tasks
    const filteredTasks = tasks?.filter(task => {
      // Search filter
      const matchesSearch =
        !filters.searchTerm ||
        task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus =
        filters.status === 'all' ||
        task.status === filters.status;

      // Priority filter
      const matchesPriority =
        filters.priority === 'all' ||
        task.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    }) || [];

    // Sort tasks
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'priority':
          // Define priority order: high > medium > low
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      // Compare values based on sort order
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Separate active and completed tasks after filtering and sorting
    const activeTasks = sortedTasks.filter(task => task.status === 'active');
    const completedTasks = sortedTasks.filter(task => task.status === 'completed');

    return { activeTasks, completedTasks };
  }, [tasks, filters]);

  // Memoized callback for filter changes
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />

        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Tasks</h1>

          <TaskForm />

          <TaskFilters onFilterChange={handleFilterChange} />

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-4">{error}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <span className="mr-2">Active Tasks</span>
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {activeTasks.length}
                  </span>
                </h2>

                {activeTasks.length > 0 ? (
                  <div className="space-y-4">
                    {activeTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-accent/50 rounded-lg">
                    <p>No active tasks match your filters.</p>
                    <p className="mt-2">Try changing your filters or add a new task.</p>
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <span className="mr-2">Completed Tasks</span>
                  <span className="bg-success text-success-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {completedTasks.length}
                  </span>
                </h2>

                {completedTasks.length > 0 ? (
                  <div className="space-y-4">
                    {completedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-accent/50 rounded-lg">
                    <p>No completed tasks match your filters.</p>
                    <p className="mt-2">Complete some tasks or try changing your filters.</p>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default TasksPage;