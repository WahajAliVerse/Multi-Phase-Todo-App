'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Tag } from '@/types';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateTask, deleteTask, toggleTaskCompletion } from '@/redux/slices/tasksSlice';
import { openModal } from '@/redux/slices/uiSlice';
import TagChip from '@/components/common/TagChip';
import Button from '@/components/ui/Button';
import { 
  PencilIcon, 
  TrashIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  CalendarIcon, 
  ClockIcon, 
  TagIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
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

  // Enhanced gradient backgrounds with modern color palette
  const priorityGradients = {
    low: 'from-emerald-500/5 via-teal-500/5 to-cyan-500/5 border-emerald-500/20',
    medium: 'from-amber-500/5 via-orange-500/5 to-yellow-500/5 border-amber-500/20',
    high: 'from-rose-500/5 via-pink-500/5 to-red-500/5 border-rose-500/20',
  };

  const priorityAccentColors = {
    low: 'from-emerald-500 to-teal-500',
    medium: 'from-amber-500 to-orange-500',
    high: 'from-rose-500 to-pink-500',
  };

  const priorityColors = {
    low: 'text-emerald-600 dark:text-emerald-400',
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
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      whileHover={{ y: -6, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        relative overflow-hidden cursor-pointer
        bg-gradient-to-br ${priorityGradients[task.priority]}
        backdrop-blur-xl
        border rounded-2xl
        shadow-md hover:shadow-2xl
        transition-all duration-500
        group
      `}
    >
      {/* Animated priority accent bar */}
      <motion.div
        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${priorityAccentColors[task.priority]}`}
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Subtle animated background glow on hover */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${priorityGradients[task.priority]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Completion status badge */}
      {task.completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 right-3 z-10"
        >
          <CheckCircleSolidIcon className="h-6 w-6 text-emerald-500 drop-shadow-lg" />
        </motion.div>
      )}

      {/* Overdue badge */}
      {isOverdue && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/90 backdrop-blur-sm rounded-full shadow-lg z-10"
        >
          <ExclamationCircleIcon className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-semibold text-white">Overdue</span>
        </motion.div>
      )}

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Enhanced custom checkbox */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCompletion();
            }}
            className={`
              mt-1 flex-shrink-0 w-6 h-6 rounded-xl
              border-2 transition-all duration-300
              flex items-center justify-center
              ${task.completed
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-transparent scale-110 shadow-md'
                : 'border-white/30 dark:border-white/20 hover:border-primary/50 hover:bg-primary/5'
              }
            `}
          >
            <motion.div
              initial={false}
              animate={{ scale: task.completed ? 1 : 0, rotate: task.completed ? 0 : -90 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
                text-lg font-bold mb-2 transition-all duration-300 line-clamp-2
                ${task.completed
                  ? 'line-through text-muted-foreground/60'
                  : 'text-foreground'
                }
              `}
            >
              {task.title}
            </motion.h3>

            {/* Description with better typography */}
            <motion.p
              className={`
                text-sm text-muted-foreground leading-relaxed
                ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}
              `}
            >
              {task.description}
            </motion.p>

            {/* Enhanced tags section */}
            {(task.tags && task.tags.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-2 mt-4"
              >
                {(task.tags || []).map((tagId, index) => {
                  const fullTag = Array.isArray(allTags) ? allTags.find(tag => tag.id === tagId) : undefined;
                  return fullTag ? (
                    <motion.div
                      key={fullTag.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
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

          {/* Right side metadata with enhanced styling */}
          <div className="flex flex-col items-end gap-2.5">
            {/* Priority badge with gradient */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`
                px-3 py-1.5 rounded-xl
                bg-gradient-to-br ${priorityAccentColors[task.priority]}
                shadow-md
              `}
            >
              <span className="text-xs font-bold text-white drop-shadow-sm">
                {priorityLabels[task.priority]}
              </span>
            </motion.div>

            {/* Due date with enhanced styling */}
            {task.dueDate && (
              <motion.div
                className={`
                  flex items-center gap-1.5 text-xs font-medium
                  ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}
                `}
              >
                <CalendarIcon className="h-4 w-4" />
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
                transition={{ duration: 0.3, type: "spring" }}
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
                {/* Enhanced metadata */}
                <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>Created: <span className="font-medium text-foreground">{formatDate(task.createdAt)}</span></span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>Updated: <span className="font-medium text-foreground">{formatDate(task.updatedAt)}</span></span>
                  </motion.div>
                </div>

                {/* Enhanced action buttons */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-2"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all hover:shadow-md"
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
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all hover:shadow-md"
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
