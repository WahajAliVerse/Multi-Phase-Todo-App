import React, { useState } from 'react';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Tag } from '@/lib/types';

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
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  availableTags: Tag[];
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
  searchQuery,
  onSearchChange,
  onReset,
  availableTags,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleTagToggle = (tagId: number) => {
    if (tagFilter.includes(tagId)) {
      onTagChange(tagFilter.filter(id => id !== tagId));
    } else {
      onTagChange([...tagFilter, tagId]);
    }
  };

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
            onChange={(e) => onRecurrenceChange(e.target.value === 'all' ? 'all' : e.target.value === 'true' ? true : false)}
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
            onChange={(e) => onReminderChange(e.target.value === 'all' ? 'all' : e.target.value === 'true' ? true : false)}
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
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="w-full"
          >
            {showAdvancedFilters ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
        </div>
      </div>
      
      {/* Advanced filters section */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search Tasks</label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by title, description, or tags..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Tags</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      tagFilter.includes(tag.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                    style={{
                      backgroundColor: tagFilter.includes(tag.id) ? tag.color : `${tag.color}20`,
                      color: tagFilter.includes(tag.id) ? getContrastColor(tag.color) : tag.color
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onReset}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

// Helper function to get contrasting text color
const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};