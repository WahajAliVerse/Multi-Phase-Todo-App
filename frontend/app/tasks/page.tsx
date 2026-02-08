'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { fetchTasks, setFilterStatus, setFilterPriority, setSearchQuery, clearError, setPagination } from '@/lib/store/slices/taskSlice';
import { openModal } from '@/lib/store/slices/modalSlice';
import TaskCard from '@/components/ui/TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { TaskRead, ModalType } from '@/lib/types';
import SearchBar from '@/components/ui/SearchBar';
import FilterControls from '@/components/ui/FilterControls';
import SortControls from '@/components/ui/SortControls';
import Link from 'next/link';

const TasksPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error, filters, pagination, sortOptions } = useSelector((state: RootState) => state.task);
  const { isOpen, type, data } = useSelector((state: RootState) => state.modal);
  
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  useEffect(() => {
    // Fetch tasks when component mounts or filters change
    const params = {
      skip: pagination.offset,
      limit: pagination.limit,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      search: filters.search || undefined,
      sort_by: sortOptions.sortBy,
      sort_order: sortOptions.sortOrder,
    };
    
    dispatch(fetchTasks(params));
  }, [dispatch, filters, pagination, sortOptions]);

  useEffect(() => {
    if (error) {
      // Show error message to user
      console.error('Error:', error);
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleCreateTask = () => {
    dispatch(openModal({ type: ModalType.TASK_MODAL, data: null }));
  };

  const handleEditTask = (task: TaskRead) => {
    dispatch(openModal({ type: ModalType.TASK_MODAL, data: task }));
  };

  const handleDeleteTask = (taskId: string) => {
    // Confirmation modal would be implemented here
    if (window.confirm('Are you sure you want to delete this task?')) {
      // Dispatch delete action
      console.log(`Deleting task with ID: ${taskId}`);
    }
  };

  const handleCompleteChange = (taskId: string, completed: boolean) => {
    // Dispatch action to mark task as complete/incomplete
    console.log(`Marking task ${taskId} as ${completed ? 'complete' : 'incomplete'}`);
  };

  const handleSearch = () => {
    dispatch(setSearchQuery(localSearch));
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    dispatch(setSearchQuery(null));
    dispatch(setFilterStatus(null));
    dispatch(setFilterPriority(null));
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <div className="flex space-x-4">
          <Button onClick={handleCreateTask}>Create New Task</Button>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Search</label>
            <SearchBar 
              onSearch={(query) => dispatch(setSearchQuery(query || null))}
              placeholder="Search tasks..."
            />
          </div>
          
          <div className="w-full md:w-auto">
            <FilterControls 
              onFilterChange={({ status, priority, dateRange }) => {
                if (status !== undefined) dispatch(setFilterStatus(status));
                if (priority !== undefined) dispatch(setFilterPriority(priority));
                // Date range filtering would require additional implementation
              }}
            />
          </div>
          
          <div className="w-full md:w-auto">
            <SortControls 
              onSortChange={(sortBy, sortOrder) => {
                dispatch(setSortOptions({ sortBy, sortOrder }));
              }}
            />
          </div>
          
          <div className="w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <p>Loading tasks...</p>
        </div>
      )}

      {/* Tasks List */}
      {!loading && (tasks || []).length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No tasks found. Create your first task!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(tasks || []).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onCompleteChange={handleCompleteChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex justify-between items-center">
        <div>
          Showing {(pagination.offset || 0) + 1} to {Math.min((pagination.offset || 0) + (pagination.limit || 0), pagination.total)} of {pagination.total} tasks
        </div>
        <div className="flex space-x-2">
          <Button 
            disabled={pagination.offset === 0}
            onClick={() => dispatch(setPagination({ 
              offset: Math.max(0, (pagination.offset || 0) - (pagination.limit || 0)), 
              limit: pagination.limit || 10 
            }))}
          >
            Previous
          </Button>
          <Button 
            disabled={(pagination.offset || 0) + (pagination.limit || 0) >= pagination.total}
            onClick={() => dispatch(setPagination({ 
              offset: (pagination.offset || 0) + (pagination.limit || 0), 
              limit: pagination.limit || 10 
            }))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;