import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './tasksSlice';
import tagsReducer from './tagsSlice';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    tags: tagsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the actions separately for use in the hook
export { 
  clearTasksError, 
  clearTasksSuccessMessage 
} from './tasksSlice';
export { 
  clearTagsError as clearTagsErrorAction, 
  clearTagsSuccessMessage as clearTagsSuccessMessageAction 
} from './tagsSlice';