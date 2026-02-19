'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  sendMessage,
  setConversation,
  clearHistory,
  setTypingIndicator,
  confirmAction,
  deleteConversation,
} from '@/redux/slices/agentChat';
import {
  ChatMessage,
  ChatAction,
  ChatConversation,
} from '@/types';
import Button from '@/components/ui/Button';
import {
  PaperAirplaneIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CalendarIcon,
  TagIcon,
  SparklesIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationCircleIcon as ExclamationCircleSolidIcon,
} from '@heroicons/react/24/solid';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Formats a timestamp into a readable time/date string
 */
const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Renders action details for task creation confirmation
 */
const ActionConfirmation: React.FC<{
  action: ChatAction;
  onConfirm: () => void;
  isConfirmed: boolean;
}> = ({ action, onConfirm, isConfirmed }) => {
  const getActionIcon = () => {
    switch (action.type) {
      case 'create_task':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'update_task':
        return <ArrowPathIcon className="w-5 h-5" />;
      case 'delete_task':
        return <TrashIcon className="w-5 h-5" />;
      case 'complete_task':
        return <CheckCircleSolidIcon className="w-5 h-5" />;
      case 'create_tag':
        return <TagIcon className="w-5 h-5" />;
      case 'create_recurrence':
        return <ClockIcon className="w-5 h-5" />;
      case 'update_recurrence':
        return <ArrowPathIcon className="w-5 h-5" />;
      case 'cancel_recurrence':
        return <TrashIcon className="w-5 h-5" />;
      case 'schedule_reminder':
        return <BellIcon className="w-5 h-5" />;
      default:
        return <SparklesIcon className="w-5 h-5" />;
    }
  };

  const getActionTitle = () => {
    const details = action.details;
    switch (action.type) {
      case 'create_task':
        return `Create task: "${details?.title || 'Untitled'}"`;
      case 'update_task':
        return `Update task: "${details?.title || action.task_id}"`;
      case 'delete_task':
        return `Delete task: "${details?.title || action.task_id}"`;
      case 'complete_task':
        return `Mark task complete: "${details?.title || action.task_id}"`;
      case 'create_tag':
        return `Create tag: "${details?.name || 'Untitled'}"`;
      case 'update_tag':
        return `Update tag: "${details?.name || action.tag_id}"`;
      case 'delete_tag':
        return `Delete tag: "${details?.name || action.tag_id}"`;
      case 'assign_tag':
        return `Add tag to task: "${details?.tag_name || 'Tag'}"`;
      case 'create_recurrence':
        return `Create recurring task: "${details?.title || 'Untitled'}"`;
      case 'update_recurrence':
        return `Update recurring pattern: "${details?.title || 'Untitled'}"`;
      case 'cancel_recurrence':
        return `Cancel recurring task: "${details?.title || 'Untitled'}"`;
      case 'schedule_reminder':
        return `Set reminder: "${details?.title || 'Task'}"`;
      default:
        return 'Confirm action';
    }
  };

  const getActionDescription = () => {
    const details = action.details;
    const parts: string[] = [];

    // Handle update_task specific details
    if (action.type === 'update_task') {
      if (details?.due_date) {
        const dueDate = new Date(details.due_date);
        const formattedDate = dueDate.toLocaleDateString([], { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
        parts.push(`📅 Due: ${formattedDate}`);
      }
      if (details?.priority) {
        const priorityIcons: Record<string, string> = {
          high: '🔴',
          medium: '🟡',
          low: '🟢'
        };
        parts.push(`${priorityIcons[details.priority] || '⚪'} Priority: ${details.priority}`);
      }
      if (details?.status) {
        const statusIcons: Record<string, string> = {
          completed: '✅',
          in_progress: '🔄',
          pending: '⏳'
        };
        parts.push(`${statusIcons[details.status] || ''} Status: ${details.status}`);
      }
      if (details?.tag_name) {
        parts.push(`🏷️ Tag: ${details.tag_name}`);
      }
      if (details?.title && action.confirmed) {
        // Show title change only after confirmation
        parts.push(`📝 Title: ${details.title}`);
      }
    }
    
    // Handle other action types
    if (action.type === 'create_task') {
      if (details?.due_date) {
        parts.push(`Due: ${new Date(details.due_date).toLocaleDateString()}`);
      }
      if (details?.priority) {
        parts.push(`Priority: ${details.priority}`);
      }
    }
    
    if (action.type === 'complete_task') {
      parts.push('Task marked as done');
    }
    
    if (action.type === 'assign_tag') {
      if (details?.tag_name) {
        parts.push(`🏷️ Tag: ${details.tag_name}`);
      }
      if (details?.tag_color) {
        parts.push(`Color: ${details.tag_color}`);
      }
      if (details?.title) {
        parts.push(`Task: ${details.title}`);
      }
    }

    if (action.type === 'create_tag') {
      if (details?.color) {
        parts.push(`🎨 Color: ${details.color}`);
      }
      if (details?.color_name) {
        parts.push(`Color name: ${details.color_name}`);
      }
    }

    if (action.type === 'update_tag') {
      if (details?.updates) {
        const updates = details.updates;
        if (updates.name) {
          parts.push(`📝 New name: ${updates.name}`);
        }
        if (updates.color) {
          parts.push(`🎨 New color: ${updates.color}`);
        }
      }
    }

    if (action.type === 'delete_tag') {
      parts.push('Tag will be permanently deleted');
    }

    if (action.type === 'create_recurrence') {
      if (details?.pattern) {
        parts.push(`Repeats: ${details.pattern}`);
      }
      if (details?.interval) {
        parts.push(`Every: ${details.interval}`);
      }
      if (details?.days_of_week) {
        const dayNames: Record<string, string> = {
          mon: 'Monday',
          tue: 'Tuesday',
          wed: 'Wednesday',
          thu: 'Thursday',
          fri: 'Friday',
          sat: 'Saturday',
          sun: 'Sunday',
        };
        const days = details.days_of_week.map((d: string) => dayNames[d] || d).join(', ');
        parts.push(`On: ${days}`);
      }
      if (details?.day_of_month) {
        const getOrdinal = (n: number) => {
          const s = ['th', 'st', 'nd', 'rd'];
          const v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        parts.push(`On the ${getOrdinal(details.day_of_month)} of each month`);
      }
      if (details?.end_condition === 'after' && details?.end_after_occurrences) {
        parts.push(`For ${details.end_after_occurrences} occurrences`);
      }
      if (details?.end_condition === 'on_date' && details?.end_date) {
        const endDate = new Date(details.end_date);
        parts.push(`Until ${endDate.toLocaleDateString()}`);
      }
      if (details?.time) {
        parts.push(`At ${details.time}`);
      }
      if (details?.recurrence_summary) {
        // Use the pre-formatted summary from backend
        parts.unshift(details.recurrence_summary);
      }
    }

    if (action.type === 'update_recurrence') {
      if (details?.recurrence_summary) {
        parts.push(`New pattern: ${details.recurrence_summary}`);
      }
      if (details?.updated_fields) {
        parts.push(`Updated: ${details.updated_fields.join(', ')}`);
      }
    }

    if (action.type === 'cancel_recurrence') {
      parts.push('Recurring pattern will be cancelled');
      parts.push('Future occurrences will not be created');
    }

    if (action.type === 'schedule_reminder') {
      if (details?.is_recurring && details?.recurrence_description) {
        parts.push(`🔁 ${details.recurrence_description}`);
      } else if (details?.reminder_time_display) {
        parts.push(`⏰ ${details.reminder_time_display}`);
      }
      if (details?.delivery_name) {
        const deliveryIcons: Record<string, string> = {
          browser: '🔔',
          email: '📧',
          push: '📱',
        };
        const icon = deliveryIcons[details.delivery_method] || '🔔';
        parts.push(`${icon} ${details.delivery_name}`);
      }
      if (details?.message) {
        parts.push(`💬 ${details.message}`);
      }
    }

    return parts.join(' • ') || 'No additional details';
  };

  if (isConfirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-2"
      >
        <CheckCircleSolidIcon className="w-5 h-5 text-success flex-shrink-0" />
        <span className="text-sm text-success font-medium">Action confirmed and executed</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-lg"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {getActionIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{getActionTitle()}</p>
          <p className="text-xs text-muted-foreground mt-1">{getActionDescription()}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onConfirm}
          className="flex items-center gap-1.5"
          startIcon={<CheckCircleIcon className="w-4 h-4" />}
        >
          Confirm
        </Button>
        <span className="text-xs text-muted-foreground self-center">
          Click to execute this action
        </span>
      </div>
    </motion.div>
  );
};

/**
 * Task disambiguation component for selecting from multiple matching tasks
 */
const TaskDisambiguation: React.FC<{
  taskMatches: Array<{
    id: string;
    title: string;
    due_date?: string | null;
    priority?: string;
    status?: string;
  }>;
  onSelectTask: (taskIndex: number) => void;
  taskReference?: string;
}> = ({ taskMatches, onSelectTask, taskReference }) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">Done</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded-full">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-500/10 text-gray-500 text-xs rounded-full">Pending</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg"
    >
      <div className="flex items-start gap-3 mb-3">
        <ExclamationCircleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">
            I found multiple tasks matching "{taskReference || 'your description'}"
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Which one did you mean?
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {taskMatches.slice(0, 5).map((task, index) => (
          <motion.button
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectTask(index)}
            className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {task.due_date && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {task.priority && (
                  <span className={`text-xs ${getPriorityColor(task.priority)} flex items-center gap-1`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {task.priority}
                  </span>
                )}
                {task.status && getStatusBadge(task.status)}
              </div>
            </div>
            <ChevronLeftIcon className="w-4 h-4 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Individual chat message component
 */
const ChatMessageItem: React.FC<{
  message: ChatMessage;
  onConfirmAction: (actionIndex: number) => void;
}> = React.memo(({ message, onConfirmAction }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <ClockIcon className="w-3 h-3" />;
      case 'sent':
        return <CheckCircleIcon className="w-3 h-3" />;
      case 'delivered':
        return <CheckCircleSolidIcon className="w-3 h-3" />;
      case 'failed':
        return <ExclamationCircleSolidIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-4"
      >
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser 
            ? 'bg-gradient-to-br from-primary to-purple-600' 
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }
        `}
      >
        {isUser ? (
          <span className="text-white text-sm font-bold">U</span>
        ) : (
          <SparklesIcon className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl shadow-sm
            ${isUser
              ? 'bg-gradient-to-br from-primary to-purple-600 text-white rounded-tr-sm'
              : 'bg-card border border-border text-foreground rounded-tl-sm'
            }
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Message metadata */}
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(message.timestamp)}
          </span>
          {!isUser && getStatusIcon() && (
            <span className="text-muted-foreground/60">{getStatusIcon()}</span>
          )}
        </div>

        {/* Action confirmations for assistant messages */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="w-full mt-2">
            {message.actions.map((action, index) => (
              action.type === 'query_tasks' ? (
                <TaskQueryResults
                  key={index}
                  action={action}
                />
              ) : (
                <ActionConfirmation
                  key={index}
                  action={action}
                  onConfirm={() => onConfirmAction(index)}
                  isConfirmed={action.confirmed || false}
                />
              )
            ))}
          </div>
        )}

        {/* Task disambiguation for assistant messages */}
        {!isUser && message.metadata?.task_matches && message.metadata.task_matches.length > 0 && (
          <div className="w-full mt-2">
            <TaskDisambiguation
              taskMatches={message.metadata.task_matches}
              taskReference={message.metadata.task_reference}
              onSelectTask={(taskIndex) => {
                // Dispatch action to select task and continue with update
                onConfirmAction(0); // Trigger first action with selected task
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

/**
 * Task list display component for query results (US4)
 */
const TaskList: React.FC<{
  tasks: Array<{
    id: string;
    title: string;
    description?: string | null;
    due_date?: string | null;
    priority?: string;
    status?: string;
    tags?: string[];
  }>;
  queryType?: string;
}> = ({ tasks, queryType = 'general' }) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">Done</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded-full">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-500/10 text-gray-500 text-xs rounded-full">Pending</span>;
    }
  };

  const formatDate = (dateString?: string | null) => {
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

  const isOverdue = (task: any) => {
    if (!task.due_date || task.status === 'completed') return false;
    try {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      return dueDate < now;
    } catch {
      return false;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {tasks.slice(0, 10).map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                {isOverdue(task) && (
                  <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-xs rounded font-medium">
                    Overdue
                  </span>
                )}
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.priority && (
                <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
              {task.status && getStatusBadge(task.status)}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            {task.due_date && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue(task) ? 'text-red-500' : 'text-muted-foreground'}`}>
                <CalendarIcon className="w-3 h-3" />
                {formatDate(task.due_date)}
              </span>
            )}
          </div>
        </motion.div>
      ))}
      {tasks.length > 10 && (
        <p className="text-center text-sm text-muted-foreground pt-2">
          ... and {tasks.length - 10} more task{tasks.length - 10 === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
};

/**
 * Task query results display component (US4)
 */
const TaskQueryResults: React.FC<{
  action: ChatAction;
}> = ({ action }) => {
  const details = action.details;
  const tasks = details?.tasks || [];
  const count = details?.count || 0;
  const queryType = details?.query_type || 'general';
  const summary = details?.summary || '';

  const getQueryTypeIcon = () => {
    switch (queryType) {
      case 'time_based':
        return <CalendarIcon className="w-5 h-5" />;
      case 'priority':
        return <SparklesIcon className="w-5 h-5" />;
      case 'tag':
        return <TagIcon className="w-5 h-5" />;
      case 'status':
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <SparklesIcon className="w-5 h-5" />;
    }
  };

  const getQueryTypeColor = () => {
    switch (queryType) {
      case 'time_based':
        return 'text-blue-500 bg-blue-500/10';
      case 'priority':
        return 'text-purple-500 bg-purple-500/10';
      case 'tag':
        return 'text-green-500 bg-green-500/10';
      case 'status':
        return 'text-orange-500 bg-orange-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-4 bg-card border border-border rounded-lg"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${getQueryTypeColor()}`}>
          {getQueryTypeIcon()}
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
      <TaskList tasks={tasks} queryType={queryType} />
    </motion.div>
  );
};

/**
 * Typing indicator component
 */
const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex gap-3 mb-4"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
      <SparklesIcon className="w-4 h-4 text-white" />
    </div>
    <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-muted-foreground/40 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

/**
 * Clear all history confirmation dialog
 */
const ClearAllConfirmationDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  conversationCount: number;
}> = ({ isOpen, onConfirm, onCancel, conversationCount }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <ExclamationCircleIcon className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Clear All History</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-foreground mb-2">
            Are you sure you want to delete all {conversationCount} conversation{conversationCount !== 1 ? 's' : ''}?
          </p>
          <p className="text-sm text-muted-foreground">
            This action will soft-delete all your conversations. They won't be visible in your history,
            but can be restored if needed. This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            fullWidth
            onClick={onConfirm}
            startIcon={<TrashIcon className="w-4 h-4" />}
          >
            Delete All ({conversationCount})
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Conversation list sidebar component with search
 */
const ConversationList: React.FC<{
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAllConversations: () => void;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearAllConversations,
  onClose,
  searchQuery,
  onSearchChange,
}) => {
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  // Filter conversations based on search query
  const filteredConversations = searchQuery.trim()
    ? conversations.filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const handleClearAll = () => {
    setShowClearAllDialog(true);
  };

  const handleConfirmClearAll = () => {
    onClearAllConversations();
    setShowClearAllDialog(false);
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Conversations</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
          <XMarkIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Search input */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full px-4 py-2 pl-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground placeholder:text-muted-foreground/50"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
            >
              <XMarkIcon className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-3 flex gap-2 border-b border-border">
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={onNewConversation}
          startIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
        >
          New Chat
        </Button>
        {conversations.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
            startIcon={<TrashIcon className="w-4 h-4" />}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            {searchQuery ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  No conversations matching "{searchQuery}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchChange('')}
                >
                  Clear search
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  group flex items-center gap-3 p-3 rounded-lg cursor-pointer
                  transition-colors mb-1
                  ${currentConversationId === conv.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted border border-transparent'
                  }
                `}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {conv.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conv.updatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                  aria-label="Delete conversation"
                >
                  <TrashIcon className="w-4 h-4 text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with count */}
      {conversations.length > 0 && (
        <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
          {filteredConversations.length} of {conversations.length} conversations
        </div>
      )}

      {/* Clear all confirmation dialog */}
      <ClearAllConfirmationDialog
        isOpen={showClearAllDialog}
        onConfirm={handleConfirmClearAll}
        onCancel={() => setShowClearAllDialog(false)}
        conversationCount={conversations.length}
      />
    </div>
  );
};

/**
 * Main Chat Modal Component
 * 
 * Features:
 * - Full chat interface with message list and input
 * - Task creation confirmation UI
 * - Typing indicator
 * - Message status (sending/sent/failed/delivered)
 * - Conversation management
 * - Responsive design with mobile support
 * - Accessible with keyboard navigation
 * - Follows Vercel React best practices
 */
const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const {
    messages,
    conversations,
    currentConversationId,
    isSending,
    typingIndicator,
    error,
  } = useAppSelector((state) => state.agentChat);
  const { user } = useAppSelector((state) => state.auth);

  const [inputValue, setInputValue] = useState('');
  const [showConversationList, setShowConversationList] = useState(false);
  const [conversationSearchQuery, setConversationSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversations when modal opens
  useEffect(() => {
    if (isOpen && conversations.length === 0) {
      // In a real implementation, this would dispatch fetchConversations()
      // For now, conversations are managed locally
    }
  }, [isOpen, conversations.length]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages.length, scrollToBottom]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Send message handler
  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isSending || !user) return;

    const request = {
      conversation_id: currentConversationId || undefined,
      content,
    };

    dispatch(sendMessage(request));
    setInputValue('');

    // Reset typing indicator after delay
    dispatch(setTypingIndicator(true));
  }, [inputValue, isSending, currentConversationId, user, dispatch]);

  // Handle Enter key (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Confirm action handler
  const handleConfirmAction = useCallback(
    (messageId: string, actionIndex: number) => {
      dispatch(confirmAction({ messageId, actionIndex }));
      // In a real implementation, this would trigger the actual task operation
      // For now, we just mark it as confirmed in the UI
    },
    [dispatch]
  );

  // Start new conversation
  const handleNewConversation = useCallback(() => {
    dispatch(setConversation(null));
    dispatch(clearHistory());
    setShowConversationList(false);
  }, [dispatch]);

  // Select conversation
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      dispatch(setConversation(conversationId));
      setShowConversationList(false);
    },
    [dispatch]
  );

  // Delete conversation
  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      if (window.confirm('Are you sure you want to delete this conversation?')) {
        dispatch(deleteConversation(conversationId));
      }
    },
    [dispatch]
  );

  // Clear all conversations
  const handleClearAllConversations = useCallback(() => {
    // In a real implementation, this would dispatch a clearAllConversations action
    // For now, we'll delete each conversation individually
    conversations.forEach((conv) => {
      dispatch(deleteConversation(conv.id));
    });
    setConversationSearchQuery('');
    setShowConversationList(false);
  }, [conversations, dispatch]);

  // Toggle conversation list
  const toggleConversationList = () => {
    setShowConversationList(!showConversationList);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        aria-hidden="true"
      />

      {/* Modal container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 max-w-4xl mx-auto z-50 flex"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
      >
        <div className="flex-1 flex flex-col bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleConversationList}
                className="p-2"
                aria-label="Toggle conversation list"
              >
                {showConversationList ? (
                  <ChevronLeftIcon className="w-5 h-5" />
                ) : (
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                )}
              </Button>
              <div>
                <h2 id="chat-modal-title" className="font-semibold text-foreground">
                  AI Task Assistant
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentConversationId
                    ? conversations.find((c) => c.id === currentConversationId)?.title || 'Chat'
                    : 'New conversation'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typingIndicator && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <SparklesIcon className="w-3 h-3" />
                  Assistant is typing...
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
                aria-label="Close chat"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>
          </header>

          {/* Main content area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversation list sidebar */}
            <AnimatePresence>
              {showConversationList && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <ConversationList
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                    onClearAllConversations={handleClearAllConversations}
                    onClose={() => setShowConversationList(false)}
                    searchQuery={conversationSearchQuery}
                    onSearchChange={setConversationSearchQuery}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-4"
                    >
                      <SparklesIcon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Welcome to AI Task Assistant
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      I can help you create, update, and manage tasks using natural language.
                      Try saying something like:
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {[
                        'Create a task to buy groceries tomorrow',
                        'Schedule a meeting next Monday at 3pm',
                        'What tasks are due this week?',
                      ].map((suggestion, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          onClick={() => setInputValue(suggestion)}
                          className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs text-foreground transition-colors"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <ChatMessageItem
                        key={message.id}
                        message={message}
                        onConfirmAction={(actionIndex) =>
                          handleConfirmAction(message.id, actionIndex)
                        }
                      />
                    ))}
                    <AnimatePresence>
                      {typingIndicator && <TypingIndicator />}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2"
                  >
                    <ExclamationCircleSolidIcon className="w-5 h-5 text-destructive flex-shrink-0" />
                    <span className="text-sm text-destructive">{error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ type: 'agentChat/clearError' })}
                      className="ml-auto p-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input area */}
              <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message... (Shift+Enter for new line)"
                      rows={1}
                      disabled={isSending}
                      className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none disabled:opacity-50 text-foreground placeholder:text-muted-foreground/50"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                      aria-label="Chat message input"
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                      {inputValue.length > 0 && `${inputValue.length} chars`}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isSending}
                    className="px-4 self-end"
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <PaperAirplaneIcon className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to send, Shift+Enter for new line • Esc to close
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatModal;
