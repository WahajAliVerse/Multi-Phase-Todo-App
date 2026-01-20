'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchTasks } from '@/store/slices/taskSlice';
import TaskCard from '@/components/TaskCard/TaskCard';
import TaskForm from '@/components/TaskForm/TaskForm';
import Navigation from '@/components/Navigation/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    // Fetch tasks when component mounts
    dispatch(fetchTasks());
  }, [dispatch]);

  // Separate active and completed tasks
  const activeTasks = tasks.filter(task => task.status === 'active');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />

        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">My Tasks</h1>

          <TaskForm />

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">Active Tasks</span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded-full">
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
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p>No active tasks. Great job!</p>
                    <p className="mt-2">Add a new task to get started.</p>
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">Completed Tasks</span>
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-medium px-2.5 py-0.5 rounded-full">
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
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p>No completed tasks yet.</p>
                    <p className="mt-2">Complete some tasks to see them here.</p>
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

export default DashboardPage;