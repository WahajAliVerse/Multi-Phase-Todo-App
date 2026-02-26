'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Tag } from '@/types';
import { PencilIcon, TrashIcon, TagIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/dateUtils';

interface TagCardProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
}

const TagCard: React.FC<TagCardProps> = ({ tag, onEdit, onDelete }) => {
  // Generate a nice gradient based on the tag color
  const getGradientFromColor = (color: string) => {
    // Simple color to gradient mapping
    const colorGradients: Record<string, string> = {
      '#EF4444': 'from-red-500 to-red-600',
      '#F97316': 'from-orange-500 to-orange-600',
      '#F59E0B': 'from-amber-500 to-amber-600',
      '#84CC16': 'from-lime-500 to-lime-600',
      '#10B981': 'from-emerald-500 to-emerald-600',
      '#06B6D4': 'from-cyan-500 to-cyan-600',
      '#3B82F6': 'from-blue-500 to-blue-600',
      '#6366F1': 'from-indigo-500 to-indigo-600',
      '#8B5CF6': 'from-violet-500 to-violet-600',
      '#D946EF': 'from-fuchsia-500 to-fuchsia-600',
      '#EC4899': 'from-pink-500 to-pink-600',
      '#14B8A6': 'from-teal-500 to-teal-600',
    };

    // Try to match the color, fallback to a default gradient
    const matchedGradient = Object.entries(colorGradients).find(([colorKey]) => 
      tag.color.toLowerCase().includes(colorKey.toLowerCase()) || 
      colorKey.toLowerCase().includes(tag.color.toLowerCase())
    );

    return matchedGradient ? matchedGradient[1] : 'from-slate-500 to-slate-600';
  };

  const gradient = getGradientFromColor(tag.color);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring" }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-md hover:shadow-2xl transition-all duration-300">
        {/* Decorative gradient orb */}
        <motion.div
          className={`absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1.2 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />

        {/* Color accent bar */}
        <div 
          className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl"
          style={{ backgroundColor: tag.color }}
        />

        <div className="relative p-6">
          {/* Header with tag icon and name */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Tag icon with color */}
              <motion.div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: `${tag.color}15`, // 15% opacity
                  border: `2px solid ${tag.color}30` // 30% opacity border
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <TagIcon className="h-6 w-6" style={{ color: tag.color }} />
              </motion.div>

              {/* Tag name */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground truncate">
                  {tag.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tag.taskCount || 0} {tag.taskCount === 1 ? 'task' : 'tasks'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(tag);
                }}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                title="Edit tag"
              >
                <PencilIcon className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(tag.id);
                }}
                className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                title="Delete tag"
              >
                <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </motion.button>
            </div>
          </div>

          {/* Color preview */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-6 h-6 rounded-full shadow-sm border border-border/30"
                style={{ backgroundColor: tag.color }}
              />
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {tag.color}
              </span>
            </div>
            <div 
              className="h-2 rounded-full w-full shadow-inner"
              style={{ 
                background: `linear-gradient(to right, ${tag.color}20, ${tag.color}60, ${tag.color})`,
                border: `1px solid ${tag.color}30`
              }}
            />
          </div>

          {/* Footer with metadata */}
          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <motion.div 
              className="flex items-center gap-2 text-xs text-muted-foreground"
              whileHover={{ x: 2 }}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Created {formatDate(tag.createdAt)}</span>
            </motion.div>

            {/* Usage indicator */}
            {(tag.taskCount || 0) > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${tag.color}15`,
                  color: tag.color
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                <span>Active</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Hover glow effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${tag.color}10 0%, transparent 70%)`
          }}
        />
      </div>
    </motion.div>
  );
};

export default TagCard;
