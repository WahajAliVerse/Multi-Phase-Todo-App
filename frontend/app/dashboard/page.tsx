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
import { useFilteredTasks } from '@/utils/taskFilters';
import { fetchTags } from '@/redux/slices/tagsSlice';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading, filters } = useAppSelector(state => state.tasks);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  // Use the filtered tasks hook
  const filteredTasks = useFilteredTasks();

  useEffect(() => {
    // Only fetch tasks if user is authenticated
    if (isAuthenticated) {
      dispatch(fetchTasks(null));
      dispatch(fetchTags());
    }
  }, [dispatch, isAuthenticated]);

  // Calculate real stats from filtered tasks
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.completed).length;
  const pendingTasks = filteredTasks.filter(task => !task.completed).length;
  const highPriorityTasks = filteredTasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = filteredTasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = filteredTasks.filter(task => task.priority === 'low').length;

  // Generate bar/line chart data based on tasks created/completed per day (last 7 days)
  const generateWeeklyData = () => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date);
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];

      const tasksCreatedOnDay = filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        return taskDate === dateStr;
      }).length;

      const tasksCompletedOnDay = filteredTasks.filter(task => {
        if (!task.completed || !task.completedAt) return false;
        const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
        return completedDate === dateStr;
      }).length;

      return {
        name: dayName,
        tasks: tasksCreatedOnDay,
        completed: tasksCompletedOnDay,
        pending: tasksCreatedOnDay - tasksCompletedOnDay
      };
    });
  };

  // Generate pie chart data based on actual task distribution
  const generatePieData = () => {
    const pieData = [];

    if (highPriorityTasks > 0) {
      pieData.push({ name: 'High Priority', value: highPriorityTasks });
    }
    if (mediumPriorityTasks > 0) {
      pieData.push({ name: 'Medium Priority', value: mediumPriorityTasks });
    }
    if (lowPriorityTasks > 0) {
      pieData.push({ name: 'Low Priority', value: lowPriorityTasks });
    }
    if (completedTasks > 0) {
      pieData.push({ name: 'Completed', value: completedTasks });
    }

    // If no tasks, show empty state
    if (pieData.length === 0) {
      pieData.push({ name: 'No Tasks', value: 0 });
    }

    return pieData;
  };

  // Calculate completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate overdue tasks
  const overdueTasks = filteredTasks.filter(task => {
    if (task.completed || !task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  const chartData = generateWeeklyData();
  const pieData = generatePieData();

  return (
    <div className="min-h-screen bg-background">
      <TaskToolbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '8rem' }}>
        <div className="max-w-7xl mx-auto">
          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card elevated>
                <CardBody>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-foreground">{totalTasks}</h3>
                      <p className="text-muted-foreground">Total Tasks</p>
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
                    <div className="p-3 rounded-full bg-success/10 dark:bg-success/20">
                      <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-foreground">{completedTasks}</h3>
                      <p className="text-muted-foreground">Completed</p>
                      {totalTasks > 0 && (
                        <p className="text-xs text-success mt-1">{completionRate}% complete</p>
                      )}
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
                    <div className="p-3 rounded-full bg-warning/10 dark:bg-warning/20">
                      <svg className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-foreground">{pendingTasks}</h3>
                      <p className="text-muted-foreground">Pending</p>
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
                    <div className="p-3 rounded-full bg-destructive/10 dark:bg-destructive/20">
                      <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-foreground">{overdueTasks}</h3>
                      <p className="text-muted-foreground">Overdue</p>
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
            className="mb-6 sm:mb-8"
          >
            <Card elevated>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Task Analytics</CardTitle>
              </CardHeader>
              <CardBody>
                <TaskCharts
                  data={chartData}
                  pieData={pieData}
                  totalTasks={totalTasks}
                  completedTasks={completedTasks}
                  pendingTasks={pendingTasks}
                  highPriorityTasks={highPriorityTasks}
                  mediumPriorityTasks={mediumPriorityTasks}
                  lowPriorityTasks={lowPriorityTasks}
                  overdueTasks={overdueTasks}
                  completionRate={completionRate}
                />
              </CardBody>
            </Card>
          </motion.div>

          {/* Task List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card elevated>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Your Tasks</CardTitle>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (tasks || []).length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-foreground">No tasks</h3>
                    <p className="mt-1 text-muted-foreground px-4">
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
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
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

export default DashboardPage;
