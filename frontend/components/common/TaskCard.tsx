'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Tag } from '@/types';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateTask, deleteTask, toggleTaskCompletion } from '@/redux/slices/tasksSlice';
import { openModal } from '@/redux/slices/uiSlice';
import TagChip from '@/components/common/TagChip';
import Button from '@/components/ui/Button';
import { PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, CalendarIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/dateUtils';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const allTags = useAppSelector(state => state.tags.tags) ?? [];
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  // Modern gradient backgrounds for priorities
  const priorityGradients = {
    low: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30',
    medium: 'from-amber-500/10 to-orange-500/10 border-amber-500/30',
    high: 'from-rose-500/10 to-red-500/10 border-rose-500/30',
  };

  const priorityColors = {
    low: 'text-cyan-600 dark:text-cyan-400',
    medium: 'text-amber-600 dark:text-amber-400',
    high: 'text-rose-600 dark:text-rose-400',
  };

  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        relative overflow-hidden cursor-pointer
        bg-gradient-to-br ${priorityGradients[task.priority]}
        backdrop-blur-xl
        border border-white/20 dark:border-white/10
        rounded-2xl
        shadow-lg hover:shadow-2xl
        transition-all duration-500
        group
      `}
    >
      {/* Animated background glow effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${priorityGradients[task.priority]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Completion status indicator */}
      {task.completed && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-success/10 rounded-bl-full overflow-hidden">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-10 h-10 bg-success/20 rounded-full blur-xl"
          />
        </div>
      )}

      {/* Overdue indicator */}
      {isOverdue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-destructive/20 backdrop-blur-sm rounded-full"
        >
          <ClockIcon className="h-3 w-3 text-destructive" />
          <span className="text-xs font-medium text-destructive">Overdue</span>
        </motion.div>
      )}

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Custom checkbox with animation */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCompletion();
            }}
            className={`
              mt-1 flex-shrink-0 w-6 h-6 rounded-lg
              border-2 transition-all duration-300
              flex items-center justify-center
              ${task.completed
                ? 'bg-success border-success scale-105'
                : 'border-white/30 dark:border-white/20 hover:border-primary/50'
              }
            `}
          >
            <motion.div
              initial={false}
              animate={{ scale: task.completed ? 1 : 0 }}
              className="text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </motion.button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            {/* Title with completion styling */}
            <motion.h3
              className={`
                text-lg font-bold mb-2 transition-all duration-300
                ${task.completed
                  ? 'line-through text-muted-foreground/60'
                  : 'text-foreground'
                }
              `}
            >
              {task.title}
            </motion.h3>

            {/* Description preview or full */}
            <motion.p
              className={`
                text-sm text-muted-foreground leading-relaxed
                ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}
              `}
            >
              {task.description}
            </motion.p>

            {/* Tags */}
            {(task.tags && task.tags.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mt-3"
              >
                {(task.tags || []).map((tagId) => {
                  const fullTag = Array.isArray(allTags) ? allTags.find(tag => tag.id === tagId) : undefined;
                  return fullTag ? (
                    <motion.div
                      key={fullTag.id}
                      whileHover={{ scale: 1.05 }}
                      className="mr-2 mb-1"
                    >
                      <TagChip tag={fullTag} />
                    </motion.div>
                  ) : (
                    <span
                      key={tagId}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 dark:bg-white/5 text-muted-foreground"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      Tag
                    </span>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Right side metadata */}
          <div className="flex flex-col items-end gap-2">
            {/* Priority badge with modern design */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`
                px-3 py-1.5 rounded-xl
                bg-white/40 dark:bg-white/10
                backdrop-blur-sm
                border border-white/20
                shadow-sm
              `}
            >
              <span className={`text-xs font-semibold ${priorityColors[task.priority]}`}>
                {priorityLabels[task.priority]}
              </span>
            </motion.div>

            {/* Due date with icon */}
            {task.dueDate && (
              <motion.div
                className={`
                  flex items-center gap-1.5 text-xs
                  ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}
                `}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>{formatDate(task.dueDate)}</span>
              </motion.div>
            )}

            {/* Expand indicator */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Expanded content with smooth animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 dark:border-white/5 bg-black/5 dark:bg-white/5 px-5 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Metadata */}
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>Created: {formatDate(task.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>Updated: {formatDate(task.updatedAt)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-2"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskCard;