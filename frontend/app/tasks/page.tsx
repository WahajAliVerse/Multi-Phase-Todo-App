'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTasks } from '@/redux/slices/tasksSlice';
import { openModal } from '@/redux/slices/uiSlice';
import TaskCard from '@/components/common/TaskCard';
import FAB from '@/components/common/FAB';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { apiCallWithFallback } from '@/utils/apiRetry';
import TaskToolbar from '@/components/common/TaskToolbar';
import { useFilteredTasks } from '@/utils/taskFilters';
import { fetchTags } from '@/redux/slices/tagsSlice';

const TasksPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector(state => state.tasks);
  
  // Use the filtered tasks hook
  const filteredTasks = useFilteredTasks();

  useEffect(() => {
    console.log('[TasksPage] Component mounted, dispatching fetchTasks');
    // Using fallback to prevent infinite loading loops
    const fetchTasksWithFallback = async () => {
      try {
        console.log('[TasksPage] About to dispatch fetchTasks');
        await dispatch(fetchTasks(null)).unwrap();
        await dispatch(fetchTags());
      } catch (error) {
        console.error('[TasksPage] Failed to fetch tasks even after retries:', error);
      }
    };

    fetchTasksWithFallback();
  }, [dispatch]);

  useEffect(() => {
    console.log('[TasksPage] State updated - tasks:', tasks, 'loading:', loading, 'count:', tasks?.length);
  }, [tasks, loading]);

  return (
    <div className="min-h-screen bg-background">
      <TaskToolbar />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '8rem' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardBody>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (tasks || []).length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-foreground">No tasks</h3>
                    <p className="mt-1 text-muted-foreground">
                      Get started by creating a new task.
                    </p>
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        onClick={() => dispatch(openModal({ mode: 0, entityType: 'task' }))}
                        className="inline-flex items-center"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Task
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-xl font-semibold text-foreground">
                        Your Tasks ({filteredTasks.length})
                      </h2>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => dispatch(openModal({ mode: 0, entityType: 'task' }))}
                        className="inline-flex items-center w-full sm:w-auto"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                    </div>
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-foreground">No tasks match your filters</h3>
                        <p className="mt-1 text-muted-foreground">
                          Try adjusting your filters or create a new task.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TaskCard task={task} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </main>
      <FAB />
    </div>
  );
};

export default TasksPage;
