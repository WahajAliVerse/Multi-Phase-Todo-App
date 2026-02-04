import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { tasksSlice } from './slices/tasksSlice';
import { tagsSlice } from './slices/tagsSlice';
import { recurrenceSlice } from './slices/recurrenceSlice';
import { remindersSlice } from './slices/remindersSlice';
import { authSlice } from './slices/authSlice';
import { authApiSlice } from './slices/authApiSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksSlice.reducer,
    tags: tagsSlice.reducer,
    recurrence: recurrenceSlice.reducer,
    reminders: remindersSlice.reducer,
    auth: authSlice.reducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(authApiSlice.middleware),
});

// Enable listener behavior for API refetching
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;