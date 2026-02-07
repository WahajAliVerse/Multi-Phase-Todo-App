import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice'; // We'll create this next
import tagReducer from './slices/tagSlice'; // We'll create this next
import notificationReducer from './slices/notificationSlice'; // We'll create this next
import modalReducer from './slices/modalSlice'; // We'll create this next

export const store = configureStore({
  reducer: {
    auth: authReducer,
    task: taskReducer,
    tag: tagReducer,
    notification: notificationReducer,
    modal: modalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the store
export default store;