import React from 'react';
import { Task } from '../../models/task';
import TaskVisualIndicators from '../common/TaskVisualIndicators';

interface TaskListItemProps {
  task: Task;
  onSelect: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

const TaskListItem: React.FC<TaskListItemProps> = ({ task, onSelect, onToggleComplete }) => {
  const handleToggleComplete = () => {
    onToggleComplete(task);
  };

  const handleSelect = () => {
    onSelect(task);
  };

  // Determine priority styling
  const priorityStyles = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-red-500',
  };

  // Format due date if it exists
  const formattedDueDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString() 
    : '';

  return (
    <div 
      className={`border-l-4 ${priorityStyles[task.priority]} bg-white rounded-r px-4 py-3 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      onClick={handleSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={handleToggleComplete}
            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                {task.description}
              </p>
            )}
          </div>
        </div>
        
        <TaskVisualIndicators task={task} />
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {formattedDueDate && `Due: ${formattedDueDate}`}
        </div>
        <div className="text-xs text-gray-500">
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </div>
      </div>
    </div>
  );
};

export default TaskListItem;