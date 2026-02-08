import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  clearTasksError, 
  clearTasksSuccessMessage, 
  clearTagsError as clearTagsErrorAction, 
  clearTagsSuccessMessage as clearTagsSuccessMessageAction,
  RootState 
} from '@/store';
import { ApiError } from '@/types/api';

interface UseApiErrorHandler {
  tasksError: string | ApiError | null;
  tagsError: string | ApiError | null;
  tasksSuccessMessage: string | null;
  tagsSuccessMessage: string | null;
  clearTasksError: () => void;
  clearTagsError: () => void;
  clearTasksSuccessMessage: () => void;
  clearTagsSuccessMessage: () => void;
}

export const useApiErrorHandler = (): UseApiErrorHandler => {
  const dispatch = useDispatch();
  
  const { error: tasksError, successMessage: tasksSuccessMessage } = useSelector(
    (state: RootState) => state.tasks
  );
  
  const { error: tagsError, successMessage: tagsSuccessMessage } = useSelector(
    (state: RootState) => state.tags
  );

  const clearTasksErrorFn = useCallback(() => {
    dispatch(clearTasksError());
  }, [dispatch]);

  const clearTagsErrorFn = useCallback(() => {
    dispatch(clearTagsErrorAction());
  }, [dispatch]);

  const clearTasksSuccessMessageFn = useCallback(() => {
    dispatch(clearTasksSuccessMessage());
  }, [dispatch]);

  const clearTagsSuccessMessageFn = useCallback(() => {
    dispatch(clearTagsSuccessMessageAction());
  }, [dispatch]);

  return {
    tasksError,
    tagsError,
    tasksSuccessMessage,
    tagsSuccessMessage,
    clearTasksError: clearTasksErrorFn,
    clearTagsError: clearTagsErrorFn,
    clearTasksSuccessMessage: clearTasksSuccessMessageFn,
    clearTagsSuccessMessage: clearTagsSuccessMessageFn
  };
};