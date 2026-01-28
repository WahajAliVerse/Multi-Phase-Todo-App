'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchTasks } from '@/store/slices/taskSlice';
import TaskCard from '@/components/TaskCard/TaskCard';
import Navigation from '@/components/Navigation/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

const TagsPage = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tasks when component mounts
    dispatch(fetchTasks());
  }, [dispatch]);

  // Extract all unique tags from tasks
  const allTags = Array.from(
    new Set(tasks?.flatMap(task => task.tags || []) || [])
  ).sort();

  // Filter tasks by selected tag
  const filteredTasks = selectedTag
    ? tasks?.filter(task => task.tags?.includes(selectedTag)) || []
    : tasks || [];

  // Group tasks by tag
  const tasksByTag: Record<string, typeof tasks> = {};
  (tasks || []).forEach(task => {
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Tag List */}
              <section className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">All Tags</h2>

                {allTags.length > 0 ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedTag(null)}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedTag === null
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      All Tasks
                      <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-0.5 rounded-full">
                        {tasks.length}
                      </span>
                    </button>

                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`w-full text-left px-4 py-2 rounded-md ${
                          selectedTag === tag
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        #{tag}
                        <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-0.5 rounded-full">
                          {tasksByTag[tag]?.length || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p>No tags found.</p>
                    <p className="mt-2">Start by adding tags to your tasks!</p>
                  </div>
                )}
              </section>

              {/* Task List for Selected Tag */}
              <section className="lg:col-span-3">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  {selectedTag ? (
                    <span>
                      Tasks with tag: <span className="text-blue-600 dark:text-blue-400">#{selectedTag}</span>
                    </span>
                  ) : (
                    <span>All Tasks</span>
                  )}
                </h2>

                {filteredTasks.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p>No tasks found for this tag.</p>
                    <p className="mt-2">Try selecting a different tag or adding tags to your tasks.</p>
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

export default TagsPage;