'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { closeModal } from '@/redux/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import TaskForm from '@/components/forms/TaskForm';
import TagForm from '@/components/forms/TagForm';
import { Task } from '@/types';

interface ModalProviderProps {
  children: React.ReactNode;
}

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { isOpen, mode, entityType, entityId } = useSelector((state: RootState) => state.ui.modal);
  const { tasks } = useSelector((state: RootState) => state.tasks);

  // Find the task to edit if in edit mode
  const taskToEdit = entityId ? tasks.find((task: Task) => task.id === entityId) : null;

  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === 0 ? `Create New ${entityType}` : `Edit ${entityType}`}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                {entityType === 'task' && (
                  <TaskForm
                    task={mode === 1 && taskToEdit ? taskToEdit : undefined}
                    onSubmitCallback={handleClose}
                    onCancel={handleClose}
                  />
                )}
                {entityType === 'tag' && (
                  <TagForm 
                    tag={mode === 1 ? { id: entityId } : undefined} 
                    onSubmitCallback={handleClose} 
                    onCancel={handleClose} 
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModalProvider;