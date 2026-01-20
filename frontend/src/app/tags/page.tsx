'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchTasks } from '@/store/slices/taskSlice';
import TaskCard from '@/components/TaskCard/TaskCard';
import Navigation from '@/components/Navigation/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

const TagsPage = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    // Fetch tasks when component mounts
    dispatch(fetchTasks());
  }, [dispatch]);

  // Extract all unique tags from tasks
  const allTags = Array.from(
    new Set(tasks.flatMap(task => task.tags || []))
  );

  // Group tasks by tag
  const tasksByTag: Record<string, typeof tasks> = {};
  tasks.forEach(task => {
    if (task.tags) {
      task.tags.forEach(tag => {
        if (!tasksByTag[tag]) {
          tasksByTag[tag] = [];
        }
        tasksByTag[tag].push(task);
      });
    }
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />

        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Tags</h1>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : allTags.length > 0 ? (
            <div className="space-y-8">
              {allTags.map(tag => (
                <section key={tag} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 capitalize">
                    #{tag}
                  </h2>
                  
                  <div className="space-y-4">
                    {tasksByTag[tag]?.map(task => (
                      <TaskCard key={`${tag}-${task.id}`} task={task} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Tags Yet</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Start by adding tags to your tasks!
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default TagsPage;