import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface TaskFiltersProps {
  onFilterChange: (filters: {
    searchTerm: string;
    status: 'all' | 'active' | 'completed';
    priority: 'all' | 'high' | 'medium' | 'low';
    sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt';
    sortOrder: 'asc' | 'desc';
  }) => void;
}

const TaskFilters = ({ onFilterChange }: TaskFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [priority, setPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleInputChange = () => {
    onFilterChange({
      searchTerm,
      status,
      priority,
      sortBy,
      sortOrder
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Trigger filter change immediately
                onFilterChange({
                  searchTerm: e.target.value,
                  status,
                  priority,
                  sortBy,
                  sortOrder
                });
              }}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              placeholder="Search tasks..."
              aria-label="Search tasks"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as 'all' | 'active' | 'completed');
                handleInputChange();
              }}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as 'all' | 'high' | 'medium' | 'low');
                handleInputChange();
              }}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-foreground mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'dueDate' | 'priority' | 'title' | 'createdAt');
                handleInputChange();
              }}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              aria-label="Sort by"
            >
              <option value="createdAt">Date Created</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-foreground mb-1">
              Order
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as 'asc' | 'desc');
                handleInputChange();
              }}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              aria-label="Sort order"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskFilters;