'use client';

import React, { useState, useEffect } from 'react';
import { TaskCard } from '@/src/components/TaskCard';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';
import { Task } from '@/src/lib/types';
import { useTasks } from '@/src/hooks/useTasks';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { 
  filterTasksByStatus, 
  filterTasksByPriority, 
  filterTasksByTags 
} from '@/src/store/slices/tasksSlice';
import { 
  useGetTasksQuery, 
  useCreateTaskMutation, 
  useUpdateTaskMutation, 
  useDeleteTaskMutation 
} from '@/src/lib/api';

// Define the page component
export default function TasksPage() {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector(state => state.tasks);
  const { 
    filterTasksAdvanced, 
    getTaskStats,
    getOverdueTasks,
    getTasksWithPendingReminders 
  } = useTasks();
  
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed' | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'low' | 'medium' | 'high' | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<number[]>([]);
  const [hasRecurrenceFilter, setHasRecurrenceFilter] = useState<boolean | 'all'>('all');
  const [hasRemindersFilter, setHasRemindersFilter] = useState<boolean | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // RTK Query hooks for API operations
  const { data: apiTasks, isLoading, isError, refetch } = useGetTasksQuery();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  // Update local state when API data changes
  useEffect(() => {
    if (apiTasks) {
      // Dispatch action to update tasks in Redux store
      // This would require creating an action to set all tasks
    }
  }, [apiTasks]);

  // Apply filters when any filter changes
  useEffect(() => {
    let result = [...tasks];
    
    // Apply advanced filtering
    result = filterTasksAdvanced({
      status: statusFilter,
      priority: priorityFilter,
      tagIds: tagFilter,
      hasRecurrence: hasRecurrenceFilter === 'all' ? undefined : hasRecurrenceFilter,
      hasReminders: hasRemindersFilter === 'all' ? undefined : hasRemindersFilter,
      searchQuery: searchQuery,
    });
    
    setFilteredTasks(result);
  }, [
    tasks, 
    statusFilter, 
    priorityFilter, 
    tagFilter, 
    hasRecurrenceFilter, 
    hasRemindersFilter, 
    searchQuery, 
    filterTasksAdvanced
  ]);

  // Handle task completion toggle
  const handleCompleteToggle = async (id: number, completed: boolean) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) return;
      
      const updatedTask = {
        ...taskToUpdate,
        status: completed ? 'completed' : 'active',
        completedAt: completed ? new Date() : undefined
      };
      
      await updateTask({ id, task: updatedTask }).unwrap();
      // Update local state
      // In a real app, this would be handled by the RTK Query cache
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Handle task edit
  const handleEdit = (task: Task) => {
    // Navigate to edit page or open modal
    console.log('Edit task:', task);
  };

  // Handle task deletion
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      await deleteTask(id).unwrap();
      // Update local state
      // In a real app, this would be handled by the RTK Query cache
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Get task statistics
  const stats = getTaskStats();

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Task Management</h1>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Tasks</h3>
          <p className="text-2xl">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Completed</h3>
          <p className="text-2xl">{stats.completed}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Active</h3>
          <p className="text-2xl">{stats.active}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Overdue</h3>
          <p className="text-2xl">{stats.overdue}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Recurrence</label>
            <Select
              value={hasRecurrenceFilter === 'all' ? 'all' : hasRecurrenceFilter.toString()}
              onChange={(e) => setHasRecurrenceFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
              options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: 'Has Recurrence' },
                { value: 'false', label: 'No Recurrence' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Reminders</label>
            <Select
              value={hasRemindersFilter === 'all' ? 'all' : hasRemindersFilter.toString()}
              onChange={(e) => setHasRemindersFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
              options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: 'Has Reminders' },
                { value: 'false', label: 'No Reminders' },
              ]}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Search</label>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, description, or tags..."
          />
        </div>
      </div>
      
      {/* Tasks List */}
      <div className="space-y-4">
        {loading || isLoading ? (
          <div className="text-center py-8">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {tasks.length === 0 
              ? "No tasks found. Create your first task!" 
              : "No tasks match the current filters."}
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCompleteToggle={handleCompleteToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}