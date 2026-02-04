import React from 'react';
import { Button } from './ui/Button';
import { Task } from '@/lib/types';
import { formatForDisplay } from '@/lib/timezone-utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onCompleteToggle: (id: number, completed: boolean) => void;
  role?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onCompleteToggle,
  role = 'article'
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
        task.status === 'completed' ? 'bg-green-50 opacity-80' : 'bg-white'
      }`}
      role={role}
      aria-label={`Task: ${task.title}`}
      aria-describedby={`task-${task.id}-description`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`text-lg font-semibold truncate ${
                task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
              }`}
              id={`task-${task.id}-title`}
            >
              {task.title}
            </h3>

            {/* Priority Badge */}
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>

            {/* Recurrence Indicator */}
            {task.recurrencePattern && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                🔁 Recurring
              </span>
            )}

            {/* Reminder Indicator */}
            {task.reminders && task.reminders.length > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                🔔 {task.reminders.length} reminder{task.reminders.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-gray-600 mt-1 text-sm truncate">{task.description}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }} // Add transparency to background
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 text-sm text-gray-500 flex flex-wrap gap-4">
            {task.dueDate && (
              <span>
                <span className="font-medium">Due:</span> {formatForDisplay(task.dueDate)}
              </span>
            )}
            <span>
              <span className="font-medium">Created:</span> {formatForDisplay(task.createdAt)}
            </span>
            {task.updatedAt && (
              <span>
                <span className="font-medium">Updated:</span> {formatForDisplay(task.updatedAt)}
              </span>
            )}
            {task.completedAt && (
              <span>
                <span className="font-medium">Completed:</span> {formatForDisplay(task.completedAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <Button
            variant={task.status === 'completed' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onCompleteToggle(task.id, task.status !== 'completed')}
          >
            {task.status === 'completed' ? 'Undo' : 'Complete'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Recurrence Pattern Details */}
      {task.recurrencePattern && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <p>
            <span className="font-medium">Repeats:</span> {task.recurrencePattern.patternType}
            {task.recurrencePattern.interval > 1 && ` every ${task.recurrencePattern.interval} ${task.recurrencePattern.patternType}s`}
          </p>
          <p>
            <span className="font-medium">Ends:</span> {
              task.recurrencePattern.endCondition === 'never' ? 'Never' :
              task.recurrencePattern.endCondition === 'after_occurrences' ?
                `After ${task.recurrencePattern.occurrenceCount} occurrence${task.recurrencePattern.occurrenceCount !== 1 ? 's' : ''}` :
              task.recurrencePattern.endDate ? `On ${formatForDisplay(task.recurrencePattern.endDate)}` : 'No end date'
            }
          </p>
        </div>
      )}
    </div>
  );
};