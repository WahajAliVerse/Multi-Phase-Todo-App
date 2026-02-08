'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTasks } from '@/redux/slices/tasksSlice';
import { openModal } from '@/redux/slices/uiSlice';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import TaskCard from '@/components/common/TaskCard';
import TaskCharts from '@/components/charts/TaskCharts';
import FAB from '@/components/common/FAB';
import TaskToolbar from '@/components/common/TaskToolbar';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector(state => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Prepare chart data
  const chartData = [
    { name: 'Mon', tasks: 4, completed: 2, pending: 2 },
    { name: 'Tue', tasks: 6, completed: 3, pending: 3 },
    { name: 'Wed', tasks: 8, completed: 5, pending: 3 },
    { name: 'Thu', tasks: 5, completed: 4, pending: 1 },
    { name: 'Fri', tasks: 7, completed: 6, pending: 1 },
    { name: 'Sat', tasks: 3, completed: 2, pending: 1 },
    { name: 'Sun', tasks: 2, completed: 1, pending: 1 },
  ];

  const pieData = [
    { name: 'High Priority', value: 12 },
    { name: 'Medium Priority', value: 24 },
    { name: 'Low Priority', value: 18 },
    { name: 'Completed', value: 30 },
  ];

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TaskToolbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card elevated>
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</h3>
                    <p className="text-gray-500 dark:text-gray-400">Total Tasks</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card elevated>
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks}</h3>
                    <p className="text-gray-500 dark:text-gray-400">Completed</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card elevated>
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pendingTasks}</h3>
                    <p className="text-gray-500 dark:text-gray-400">Pending</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card elevated>
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{highPriorityTasks}</h3>
                    <p className="text-gray-500 dark:text-gray-400">High Priority</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card elevated>
            <CardHeader>
              <CardTitle>Task Analytics</CardTitle>
            </CardHeader>
            <CardBody>
              <TaskCharts 
                data={chartData} 
                pieData={pieData} 
              />
            </CardBody>
          </Card>
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-8"
        >
          <Card elevated>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No tasks</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
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
                  <div className="mb-6">
                    <Button 
                      variant="primary" 
                      onClick={() => dispatch(openModal({ mode: 0, entityType: 'task' }))}
                      className="inline-flex items-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </main>

      <FAB />
    </div>
  );
};

export default DashboardPage;