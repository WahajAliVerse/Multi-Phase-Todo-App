'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchTasks } from '@/store/slices/taskSlice';
import Navigation from '@/components/Navigation/Navigation';

export default function Home() {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    // Fetch tasks when component mounts
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Welcome to Your Todo App
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A modern, responsive todo application with light/dark themes, priorities, tags, and more.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Organize Tasks</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Assign priorities and tags to keep your tasks organized and manageable.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Smart Filtering</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Search, filter, and sort your tasks to find what matters most right now.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Stay on Track</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Set due dates and get reminders to stay on top of your deadlines.
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Recent Tasks</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : tasks.length > 0 ? (
            <ul className="space-y-4">
              {tasks.slice(0, 5).map((task) => (
                <li 
                  key={task.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                      {task.title}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      task.priority === 'high' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' 
                        : task.priority === 'medium' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{task.description}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No tasks yet. Create your first task to get started!
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Todo App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}