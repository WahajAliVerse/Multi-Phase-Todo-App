import { useState } from 'react';
import { Button } from './ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Input } from './ui/Input';

interface TaskFiltersProps {
  onFilterChange: (filters: {
    status?: 'active' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    search?: string;
  }) => void;
}

export const TaskFilters = ({ onFilterChange }: TaskFiltersProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const applyFilters = () => {
    const filters: {
      status?: 'active' | 'completed';
      priority?: 'low' | 'medium' | 'high';
      search?: string;
    } = {};

    if (statusFilter !== 'all') {
      filters.status = statusFilter as 'active' | 'completed';
    }

    if (priorityFilter !== 'all') {
      filters.priority = priorityFilter as 'low' | 'medium' | 'high';
    }

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }

    onFilterChange(filters);
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Priority</label>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Search</label>
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex space-x-2 pt-2">
        <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
        <Button onClick={resetFilters} variant="outline" className="flex-1">Reset</Button>
      </div>
    </div>
  );
};