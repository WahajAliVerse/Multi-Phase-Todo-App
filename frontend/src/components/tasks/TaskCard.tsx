import React from 'react';
import { Task } from '../../models/task';
import { Tag } from '../../models/tag';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onToggleComplete?: () => void;
  className?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onClick, 
  onToggleComplete,
  className = '' 
}) => {
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
      className={`border-l-4 ${priorityStyles[task.priority]} bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={(e) => {
              e.stopPropagation();
              onToggleComplete && onToggleComplete();
            }}
            className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
          />
          <div className="ml-3 flex-1 min-w-0">
            <h3 className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-gray-500 truncate">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Tags Display */}
        {task.tags && task.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {task.tags.map((tag: Tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${tag.color}20`, 
                  color: tag.color 
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {formattedDueDate && `Due: ${formattedDueDate}`}
          </div>
          <div className="text-xs text-gray-500">
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;