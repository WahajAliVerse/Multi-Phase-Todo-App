import { configureStore, Middleware } from '@reduxjs/toolkit';
import { logout } from './slices/authSlice';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import tagsReducer from './slices/tagsSlice';
import uiReducer from './slices/uiSlice';

// Middleware to handle 401 errors globally
const unauthenticatedMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  // Check if this is a rejected action with 401 status
  if (typeof action.type === 'string' && action.type.endsWith('/rejected') && action.payload?.status === 401) {
    // Dispatch logout action to clear user state
    storeAPI.dispatch(logout());
    // Optionally redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    tags: tagsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(unauthenticatedMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;