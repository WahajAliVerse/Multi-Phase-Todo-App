import { configureStore } from '@reduxjs/toolkit';
import { tasksSlice } from './slices/tasksSlice';
import { tagsSlice } from './slices/tagsSlice';
import { recurrenceSlice } from './slices/recurrenceSlice';
import { remindersSlice } from './slices/remindersSlice';
import { authSlice } from './slices/authSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksSlice.reducer,
    tags: tagsSlice.reducer,
    recurrence: recurrenceSlice.reducer,
    reminders: remindersSlice.reducer,
    auth: authSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;