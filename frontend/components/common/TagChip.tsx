'use client';

import React from 'react';
import { Tag } from '@/types';
import { motion } from 'framer-motion';

interface TagChipProps {
  tag: Tag;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outlined' | 'ghost';
}

const TagChip: React.FC<TagChipProps> = ({ 
  tag, 
  onClick, 
  removable = false, 
  onRemove,
  size = 'md',
  variant = 'solid'
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Style variants
  const getVariantStyles = () => {
    const baseOpacity = 15; // 15% opacity
    const borderOpacity = 30; // 30% opacity
    
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: `${tag.color}05`, // 5% opacity
          borderColor: tag.color,
          borderWidth: '1.5px',
          borderStyle: 'solid',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: '0px',
          color: tag.color,
        };
      case 'solid':
      default:
        return {
          backgroundColor: `${tag.color}${baseOpacity.toString(16).padStart(2, '0')}`,
          borderColor: `${tag.color}${borderOpacity.toString(16).padStart(2, '0')}`,
          borderWidth: '1px',
          borderStyle: 'solid',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <motion.div
      className={`
        inline-flex items-center rounded-full font-medium cursor-pointer 
        transition-all duration-300 select-none
        ${sizeClasses[size]}
      `}
      style={variantStyles}
      onClick={handleClick}
      whileHover={{ 
        scale: 1.08, 
        boxShadow: `0 4px 12px ${tag.color}40`, // 40% opacity shadow
        translateY: -2
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
    >
      {/* Color indicator dot with glow */}
      <motion.div
        className="relative flex items-center justify-center mr-2"
        whileHover={{ scale: 1.2 }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full shadow-sm"
          style={{ 
            backgroundColor: tag.color,
            boxShadow: `0 0 8px ${tag.color}60` // 60% opacity glow
          }}
        />
        {/* Subtle ring animation on hover */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${tag.color}` }}
          initial={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>

      {/* Tag name */}
      <span 
        className="text-foreground/90 dark:text-foreground"
        style={{ color: variant === 'ghost' ? tag.color : undefined }}
      >
        {tag.name}
      </span>

      {/* Remove button */}
      {removable && (
        <motion.button
          onClick={handleRemove}
          className="ml-1.5 -mr-1 p-0.5 rounded-full transition-colors duration-200"
          style={{ 
            backgroundColor: `${tag.color}20`, // 20% opacity
          }}
          whileHover={{ 
            scale: 1.15,
            backgroundColor: `${tag.color}40`, // 40% opacity
          }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <svg 
            className="h-3.5 w-3.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style={{ color: tag.color }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </motion.button>
      )}

      {/* Subtle shine effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          style={{
            animation: 'shine 0.6s ease-in-out',
          }}
        />
      </motion.div>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default TagChip;
