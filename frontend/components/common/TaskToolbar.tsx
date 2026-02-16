'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setFilterStatus, setFilterPriority, setFilterTag, setFilterSearch, setFilterSort } from '@/redux/slices/tasksSlice';
import { FunnelIcon, MagnifyingGlassIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

const TaskToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters, tags } = useAppSelector(state => state.tasks);
  const allTags = useAppSelector(state => state.tags.tags);

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search is now in Redux state
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilterStatus(e.target.value as 'all' | 'active' | 'completed'));
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high'));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilterTag(e.target.value));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilterSearch(e.target.value));
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    dispatch(setFilterSort({ sortBy: 'createdAt', sortOrder: newSortOrder }));
  };

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border px-3 sm:px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring sm:text-sm"
              placeholder="Search tasks..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center md:justify-end">
          <div className="relative">
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="appearance-none bg-background border border-input rounded-md pl-3 pr-8 sm:pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>

          <div className="relative">
            <select
              value={filters.priority}
              onChange={handlePriorityChange}
              className="appearance-none bg-background border border-input rounded-md pl-3 pr-8 sm:pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring sm:text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>

          <div className="relative">
            <select
              value={filters.tag}
              onChange={handleTagChange}
              className="appearance-none bg-background border border-input rounded-md pl-3 pr-8 sm:pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring sm:text-sm"
            >
              <option value="all">All Tags</option>
              {Array.isArray(allTags) && allTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-center space-x-1 border-l border-border pl-3">
            <button 
              onClick={handleSortToggle}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? (
                <ArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskToolbar;