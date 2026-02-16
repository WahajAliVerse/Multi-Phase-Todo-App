import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/redux/hooks';
import { openModal } from '@/redux/slices/uiSlice';

const FAB: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(openModal({ mode: 0, entityType: 'task' }));
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Add new task"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </motion.div>
    </motion.button>
  );
};

export default FAB;