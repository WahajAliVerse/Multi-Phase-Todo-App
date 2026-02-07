'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { fetchTasks } from '@/lib/store/slices/taskSlice';
import { fetchTags } from '@/lib/store/slices/tagSlice';
import { TaskCard } from '@/components/ui/TaskCard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { openModal } from '@/lib/store/slices/modalSlice';
import { ModalType } from '@/lib/types';

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector((state: RootState) => state.task);
  const { tags } = useSelector((state: RootState) => state.tags);

  useEffect(() => {
    // Fetch tasks and tags when the component mounts
    dispatch(fetchTasks({ limit: 10 })); // Fetch only first 10 tasks for dashboard
    dispatch(fetchTags());
  }, [dispatch]);

  const handleCreateTask = () => {
    dispatch(openModal({ type: ModalType.TASK_MODAL, data: null }));
  };

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleCreateTask}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-muted-foreground">Total Tasks</h3>
          <p className="text-3xl font-bold">{totalTasks}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-muted-foreground">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-muted-foreground">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingTasks}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-muted-foreground">High Priority</h3>
          <p className="text-3xl font-bold text-red-600">{highPriorityTasks}</p>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Tasks</h2>
          <a href="/tasks" className="text-primary hover:underline">View All</a>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">No tasks found. Create your first task!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.slice(0, 6).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(task) => dispatch(openModal({ type: ModalType.TASK_MODAL, data: task }))}
                onDelete={(taskId) => console.log(`Delete task: ${taskId}`)}
                onCompleteChange={(taskId, completed) => console.log(`Mark task ${taskId} as ${completed ? 'complete' : 'incomplete'}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-card p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="justify-start">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Task
          </Button>
          <Button variant="outline" className="justify-start">
            View All Tasks
          </Button>
          <Button variant="outline" className="justify-start">
            Manage Tags
          </Button>
          <Button variant="outline" className="justify-start">
            View Calendar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;