import React from 'react';
import { Task } from '../../models/task';

interface TaskVisualIndicatorProps {
  task: Task;
  className?: string;
}

const TaskVisualIndicator: React.FC<TaskVisualIndicatorProps> = ({ task, className = '' }) => {
  // Determine which special attributes the task has
  const hasRecurrence = !!task.recurrencePattern;
  const hasReminders = task.reminders && task.reminders.length > 0;
  const hasTags = task.tags && task.tags.length > 0;
  const isHighPriority = task.priority === 'high';
  const isCompleted = task.status === 'completed';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* High Priority Indicator */}
      {isHighPriority && (
        <div 
          className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800"
          title="High Priority Task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Recurrence Indicator */}
      {hasRecurrence && (
        <div 
          className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800"
          title={`Recurring task: ${task.recurrencePattern?.patternType}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Reminder Indicator */}
      {hasReminders && (
        <div 
          className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800"
          title={`Task has ${task.reminders?.length} reminder(s)`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Tags Indicator */}
      {hasTags && (
        <div 
          className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800"
          title={`Task has ${task.tags?.length} tag(s)`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Overdue Indicator */}
      {isOverdue && (
        <div 
          className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white"
          title="Task is overdue"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Completed Indicator */}
      {isCompleted && (
        <div 
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-800"
          title="Task is completed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default TaskVisualIndicator;