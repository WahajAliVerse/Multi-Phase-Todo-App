import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PrioritySelectorProps {
  priority: string;
  onPriorityChange: (priority: string) => void;
  label?: string;
  className?: string;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({ 
  priority, 
  onPriorityChange, 
  label = 'Priority',
  className = ''
}) => {
  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' },
  ];

  const selectedOption = priorityOptions.find(option => option.value === priority);
  const displayColor = selectedOption ? selectedOption.color : 'text-gray-600';

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="priority-selector">{label}</Label>
      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger id="priority-selector" className="w-full">
          <span className={`capitalize ${displayColor}`}>
            <SelectValue placeholder="Select priority" />
          </span>
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className={option.color}
            >
              <span className={option.color}>{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PrioritySelector;