'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TaskList } from '@/components/TaskList';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useGetTasksQuery } from '@/lib/api';
import { Task } from '@/lib/types';
import { formatForDisplay } from '@/lib/timezone-utils';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { data: tasks = [], isLoading: apiLoading, isError, error: apiError } = useGetTasksQuery();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // The tasks are loaded automatically by the RTK Query hook

  // Calculate task statistics
  const loading = apiLoading;
  const error = isError ? apiError?.toString() : null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const activeTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  // Get upcoming tasks (due in next 7 days)
  const upcomingTasks = tasks
    .filter(task =>
      task.dueDate &&
      task.status !== 'completed' &&
      new Date(task.dueDate) >= new Date() &&
      new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5); // Take only first 5

  // Get tasks with reminders due soon
  const tasksWithReminders = tasks
    .filter(task =>
      task.reminders &&
      task.reminders.length > 0 &&
      task.status !== 'completed'
    )
    .slice(0, 5); // Take only first 5

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md" role="alert">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Tasks</CardDescription>
                <CardTitle className="text-2xl">{totalTasks}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  {activeTasks} active, {completedTasks} completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Tasks</CardDescription>
                <CardTitle className="text-2xl">{activeTasks}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  {Math.round(activeTasks > 0 ? (activeTasks / totalTasks) * 100 : 0)}% of all tasks
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-2xl">{completedTasks}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  {Math.round(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0)}% completion rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Overdue</CardDescription>
                <CardTitle className="text-2xl">{overdueTasks}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-sm ${overdueTasks > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {overdueTasks > 0
                    ? `${Math.round((overdueTasks / activeTasks) * 100)}% of active tasks`
                    : 'All caught up!'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Tasks</CardTitle>
                  <CardDescription>
                    Manage your tasks, set reminders, and organize with tags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <TaskList
                      tasks={tasks}
                      loading={loading}
                      error={error?.toString()}
                      onTaskEdit={(task) => router.push(`/tasks/${task.id}/edit`)}
                      onTaskDelete={(id) => {
                        // Dispatch delete action
                        if (confirm('Are you sure you want to delete this task?')) {
                          // Implementation would go here
                        }
                      }}
                      onTaskCompleteToggle={(id, completed) => {
                        // Dispatch complete toggle action
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Upcoming Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>
                    Tasks due in the next 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingTasks.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {upcomingTasks.map(task => (
                        <li key={task.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                new Date(task.dueDate!) < new Date(Date.now() + 24 * 60 * 60 * 1000) 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {new Date(task.dueDate!) < new Date(Date.now() + 24 * 60 * 60 * 1000) ? '!' : '📅'}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                              <p className="text-sm text-gray-500 truncate">
                                Due: {new Date(task.dueDate!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No upcoming tasks in the next 7 days</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Tasks with Reminders */}
              <Card>
                <CardHeader>
                  <CardTitle>Tasks with Reminders</CardTitle>
                  <CardDescription>
                    Tasks with upcoming or pending reminders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tasksWithReminders.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {tasksWithReminders.map(task => (
                        <li key={task.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                                🔔
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                              <p className="text-sm text-gray-500">
                                {task.reminders?.length} reminder{task.reminders?.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No tasks with reminders</p>
                  )}
                </CardContent>
              </Card>
              
              <Button 
                onClick={() => router.push('/tasks/create')} 
                className="w-full"
              >
                Create New Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}