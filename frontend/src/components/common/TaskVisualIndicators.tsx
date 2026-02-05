import React from 'react';
import { Task } from '../../models/task';

interface TaskVisualIndicatorsProps {
  task: Task;
  className?: string;
}

const TaskVisualIndicators: React.FC<TaskVisualIndicatorsProps> = ({ task, className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Recurrence Indicator */}
      {task.recurrencePattern && (
        <div 
          className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800"
          title={`Recurring task: ${task.recurrencePattern.patternType}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Reminder Indicator */}
      {task.reminders && task.reminders.length > 0 && (
        <div 
          className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800"
          title={`Task has ${task.reminders.length} reminder(s)`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Tag Indicators */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex -space-x-1">
          {task.tags.slice(0, 3).map((tag, index) => (
            <div
              key={index}
              className="w-5 h-5 rounded-full border border-white"
              style={{ backgroundColor: tag.color }}
              title={tag.name}
            />
          ))}
          {task.tags.length > 3 && (
            <div 
              className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs"
              title={`${task.tags.length - 3} more tags`}
            >
              +{task.tags.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Due Date Indicator */}
      {task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) && ( // Within 24 hours
        <div 
          className={`flex items-center justify-center w-6 h-6 rounded-full ${
            new Date(task.dueDate) < new Date() 
              ? 'bg-red-100 text-red-800' 
              : 'bg-orange-100 text-orange-800'
          }`}
          title={`Due: ${new Date(task.dueDate).toLocaleString()}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default TaskVisualIndicators;