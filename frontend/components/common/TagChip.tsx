import React from 'react';
import { Tag } from '@/types';
import { motion } from 'framer-motion';

interface TagChipProps {
  tag: Tag;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

const TagChip: React.FC<TagChipProps> = ({ tag, onClick, removable = false, onRemove }) => {
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

  return (
    <motion.div 
      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mr-3 mb-3 cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm"
      style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color, borderWidth: '1px' }} // 20% opacity for background
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
    >
      <span 
        className="w-3 h-3 rounded-full mr-2" 
        style={{ backgroundColor: tag.color }}
      ></span>
      {tag.name}
      {removable && (
        <button 
          onClick={handleRemove}
          className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
};

export default TagChip;