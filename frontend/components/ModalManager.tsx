'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { closeModal } from '@/lib/store/slices/modalSlice';
import { createTask, updateTask } from '@/lib/store/slices/taskSlice';
import TaskModal from '@/components/ui/TaskModal';
import { TaskRead, ModalType } from '@/lib/types';

const ModalManager = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isOpen, type, data } = useSelector((state: RootState) => state.modal);

  // Close modal handler
  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  // Save handler for task modal
  const handleSaveTask = async (taskData: any) => {
    try {
      if (data && data.id) {
        // Updating existing task
        await dispatch(updateTask({ taskId: data.id, taskData }));
      } else {
        // Creating new task
        await dispatch(createTask(taskData));
      }
      dispatch(closeModal());
    } catch (error) {
      console.error('Error saving task:', error);
      // Handle error appropriately
    }
  };

  // Render the appropriate modal based on the type
  const renderModal = () => {
    switch (type) {
      case ModalType.TASK_MODAL:
        return (
          <TaskModal
            isOpen={isOpen}
            onClose={handleCloseModal}
            task={data as TaskRead | null}
            onSave={handleSaveTask}
            tags={[]} // Actual tags would be fetched from state
          />
        );
      default:
        return null;
    }
  };

  // Handle Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        dispatch(closeModal());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, dispatch]);

  return <>{renderModal()}</>;
};

export default ModalManager;