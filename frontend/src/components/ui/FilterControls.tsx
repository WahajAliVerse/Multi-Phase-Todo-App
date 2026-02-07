import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FilterIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface FilterControlsProps {
  onFilterChange: (filters: {
    status?: string;
    priority?: string;
    dateRange?: { from: Date | undefined; to: Date | undefined };
  }) => void;
  className?: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onFilterChange, className = '' }) => {
  const [status, setStatus] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [showCalendar, setShowCalendar] = useState(false);

  const applyFilters = () => {
    const filters: {
      status?: string;
      priority?: string;
      dateRange?: { from: Date | undefined; to: Date | undefined };
    } = {};

    if (status !== 'all') filters.status = status;
    if (priority !== 'all') filters.priority = priority;
    if (dateRange.from || dateRange.to) filters.dateRange = dateRange;

    onFilterChange(filters);
  };

  const clearFilters = () => {
    setStatus('all');
    setPriority('all');
    setDateRange({ from: undefined, to: undefined });
    onFilterChange({});
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    // Apply filter immediately
    const filters = { status: value === 'all' ? undefined : value, priority: priority === 'all' ? undefined : priority, dateRange };
    onFilterChange(filters);
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value);
    // Apply filter immediately
    const filters = { status: status === 'all' ? undefined : status, priority: value === 'all' ? undefined : value, dateRange };
    onFilterChange(filters);
  };

  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    // Apply filter immediately
    const filters = { status: status === 'all' ? undefined : status, priority: priority === 'all' ? undefined : priority, dateRange: range };
    onFilterChange(filters);
  };

  return (
    <div className={`flex flex-wrap gap-4 items-center ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Status:</span>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Priority:</span>
        <Select value={priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Popover open={showCalendar} onOpenChange={setShowCalendar}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
              ) : (
                `From ${dateRange.from.toLocaleDateString()}`
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {(status !== 'all' || priority !== 'all' || dateRange.from || dateRange.to) && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default FilterControls;