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
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      aria-label="Add new task"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <PlusIcon className="h-6 w-6" />
      </motion.div>
    </motion.button>
  );
};

export default FAB;