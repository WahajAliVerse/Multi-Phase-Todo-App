'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  TagIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Task item displayed in a list within chat messages
 */
interface TaskListItem {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: string;
  status?: string;
  tags?: string[];
}

/**
 * Props for ChatMessageList component
 */
interface ChatMessageListProps {
  /** List of tasks to display */
  tasks: TaskListItem[];
  /** Type of query that generated this list */
  queryType?: 'time_based' | 'priority' | 'tag' | 'status' | 'general';
  /** Summary text to display above the list */
  summary?: string;
  /** Maximum number of tasks to display (default: 10) */
  maxDisplay?: number;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Whether to show overdue indicators */
  showOverdue?: boolean;
  /** Click handler for task items (optional) */
  onTaskClick?: (task: TaskListItem) => void;
}

/**
 * ChatMessageList Component (US4 - Intelligent Task Queries)
 * 
 * Displays a list of tasks within a chat message response.
 * Used for query results like "What tasks are due this week?"
 * 
 * Features:
 * - Displays up to maxDisplay tasks with overflow indicator
 * - Shows priority badges, due dates, and status
 * - Highlights overdue tasks
 * - Responsive design with animations
 * - Empty state handling
 */
export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  tasks,
  queryType = 'general',
  summary,
  maxDisplay = 10,
  emptyMessage,
  showOverdue = true,
  onTaskClick,
}) => {
  const count = tasks.length;

  // Get icon and color based on query type
  const getQueryTypeConfig = () => {
    switch (queryType) {
      case 'time_based':
        return {
          icon: CalendarIcon,
          color: 'text-blue-500 bg-blue-500/10',
          label: 'Time-based',
        };
      case 'priority':
        return {
          icon: SparklesIcon,
          color: 'text-purple-500 bg-purple-500/10',
          label: 'Priority',
        };
      case 'tag':
        return {
          icon: TagIcon,
          color: 'text-green-500 bg-green-500/10',
          label: 'Tag',
        };
      case 'status':
        return {
          icon: CheckCircleIcon,
          color: 'text-orange-500 bg-orange-500/10',
          label: 'Status',
        };
      default:
        return {
          icon: SparklesIcon,
          color: 'text-gray-500 bg-gray-500/10',
          label: 'Tasks',
        };
    }
  };

  const config = getQueryTypeConfig();
  const IconComponent = config.icon;

  // Get priority badge styling
  const getPriorityBadge = (priority?: string) => {
    const styles: Record<string, string> = {
      high: 'text-red-500 bg-red-500/10',
      medium: 'text-yellow-500 bg-yellow-500/10',
      low: 'text-green-500 bg-green-500/10',
    };
    const style = styles[priority || ''] || 'text-gray-500 bg-gray-500/10';
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${style}`}>
        {priority}
      </span>
    );
  };

  // Get status badge styling
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">
            Done
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded-full">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-500/10 text-gray-500 text-xs rounded-full">
            Pending
          </span>
        );
    }
  };

  // Format due date for display
  const formatDueDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Check if task is overdue
  const isOverdue = (task: TaskListItem) => {
    if (!showOverdue || !task.due_date || task.status === 'completed') return false;
    try {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      return dueDate < now;
    } catch {
      return false;
    }
  };

  // Handle empty state
  if (count === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{emptyMessage || 'No tasks found'}</p>
      </div>
    );
  }

  const displayTasks = tasks.slice(0, maxDisplay);
  const remainingCount = count - maxDisplay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3"
    >
      {/* Header with count and summary */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${config.color}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">
            {count} Task{count === 1 ? '' : 's'} Found
          </p>
          {summary && (
            <p className="text-xs text-muted-foreground mt-1">{summary}</p>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {displayTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onTaskClick?.(task)}
            className={`p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-all ${
              onTaskClick ? 'cursor-pointer' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {task.title}
                  </p>
                  {isOverdue(task) && (
                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-xs rounded font-medium flex-shrink-0">
                      Overdue
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {task.priority && getPriorityBadge(task.priority)}
                {task.status && getStatusBadge(task.status)}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              {task.due_date && (
                <span
                  className={`text-xs flex items-center gap-1 ${
                    isOverdue(task) ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  <CalendarIcon className="w-3 h-3" />
                  {formatDueDate(task.due_date)}
                </span>
              )}
              {task.tags && task.tags.length > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <TagIcon className="w-3 h-3" />
                  {task.tags.length} tag{task.tags.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overflow indicator */}
      {remainingCount > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: maxDisplay * 0.05 }}
          className="text-center text-sm text-muted-foreground pt-2"
        >
          ... and {remainingCount} more task{remainingCount === 1 ? '' : 's'}
        </motion.p>
      )}
    </motion.div>
  );
};

/**
 * Empty state component for query results
 */
export const QueryEmptyState: React.FC<{
  queryType?: string;
  customMessage?: string;
}> = ({ queryType = 'general', customMessage }) => {
  const getEmptyMessage = () => {
    if (customMessage) return customMessage;

    const messages: Record<string, string> = {
      time_based: 'No tasks found for this time period.',
      priority: 'No tasks with this priority level.',
      tag: 'No tasks found with this tag.',
      status: 'No tasks with this status.',
      general: 'You don\'t have any tasks yet. Create one by saying "Create a task to buy groceries"',
    };

    return messages[queryType] || 'No tasks found.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-4 bg-card border border-border rounded-lg text-center"
    >
      <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p className="text-muted-foreground">{getEmptyMessage()}</p>
    </motion.div>
  );
};

/**
 * Overdue warning banner component
 */
export const OverdueBanner: React.FC<{
  count: number;
  onDismiss?: () => void;
}> = ({ count, onDismiss }) => {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
        <span className="text-sm text-red-500 font-medium">
          You have {count} overdue task{count === 1 ? '' : 's'}
        </span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-400 transition-colors"
        >
          <span className="sr-only">Dismiss</span>
          ×
        </button>
      )}
    </motion.div>
  );
};

export default ChatMessageList;
