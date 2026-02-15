'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Task, Tag } from '@/types';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateTask, deleteTask, toggleTaskCompletion } from '@/redux/slices/tasksSlice';
import { openModal } from '@/redux/slices/uiSlice';
import TagChip from '@/components/common/TagChip';
import Button from '@/components/ui/Button';
import { PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/dateUtils';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const allTags = useAppSelector(state => state.tags.tags) ?? [];
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleCompletion = () => {
    dispatch(toggleTaskCompletion({ id: task.id, completed: !task.completed }));
    dispatch(updateTask({
      id: task.id,
      taskData: { 
        completed: !task.completed,
        userId: user?.id
      }
    }));
  };

  const handleEdit = () => {
    dispatch(openModal({ mode: 1, entityType: 'task', entityId: task.id }));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(task.id));
    }
  };

  const priorityColors = {
    low: 'border-l-info',
    medium: 'border-l-warning',
    high: 'border-l-destructive',
  };

  const priorityBgColors = {
    low: 'bg-info/20 text-info-foreground',
    medium: 'bg-warning/20 text-warning-foreground',
    high: 'bg-destructive/20 text-destructive-foreground',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className={`border-l-4 ${priorityColors[task.priority]} bg-card rounded-xl shadow-sm transition-all duration-300 overflow-hidden cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => {
                e.stopPropagation();
                handleToggleCompletion();
              }}
              className="mt-1 h-5 w-5 text-primary rounded focus:ring-primary"
            />
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.title}
              </h3>
              {!isExpanded && task.description && (
                <p className="mt-1 text-muted-foreground truncate">
                  {task.description}
                </p>
              )}
              {isExpanded && task.description && (
                <p className="mt-2 text-muted-foreground">
                  {task.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {(task.tags || []).map((tagId, index) => {
                  // Find the full tag object from the tags state
                  const fullTag = Array.isArray(allTags) ? allTags.find(tag => tag.id === tagId) : undefined;
                  return fullTag ? (
                    <div key={fullTag.id} className="mr-2 mb-2">
                      <TagChip tag={fullTag} />
                    </div>
                  ) : (
                    // Fallback to display tag ID if full tag object not found
                    <span
                      key={tagId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                    >
                      {tagId}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3 ml-2">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priorityBgColors[task.priority]}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 rounded-full hover:bg-accent text-muted-foreground"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {task.dueDate && (
              <span className="text-xs text-muted-foreground flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border bg-muted px-5 py-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <p>Created: {formatDate(task.createdAt)}</p>
              <p>Updated: {formatDate(task.updatedAt)}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TaskCard;