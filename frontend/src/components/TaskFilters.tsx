import React from 'react';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface TaskFiltersProps {
  statusFilter: 'active' | 'completed' | 'all';
  onStatusChange: (status: 'active' | 'completed' | 'all') => void;
  priorityFilter: 'low' | 'medium' | 'high' | 'all';
  onPriorityChange: (priority: 'low' | 'medium' | 'high' | 'all') => void;
  recurrenceFilter: boolean | 'all';
  onRecurrenceChange: (recurrence: boolean | 'all') => void;
  reminderFilter: boolean | 'all';
  onReminderChange: (reminder: boolean | 'all') => void;
  tagFilter: number[];
  onTagChange: (tagIds: number[]) => void;
  onReset: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  recurrenceFilter,
  onRecurrenceChange,
  reminderFilter,
  onReminderChange,
  tagFilter,
  onTagChange,
  onReset,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as any)}
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
            onChange={(e) => onPriorityChange(e.target.value as any)}
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
            value={recurrenceFilter === 'all' ? 'all' : recurrenceFilter.toString()}
            onChange={(e) => onRecurrenceChange(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
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
            value={reminderFilter === 'all' ? 'all' : reminderFilter.toString()}
            onChange={(e) => onReminderChange(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
            options={[
              { value: 'all', label: 'All' },
              { value: 'true', label: 'Has Reminders' },
              { value: 'false', label: 'No Reminders' },
            ]}
          />
        </div>
        
        <div className="flex items-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onReset}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};