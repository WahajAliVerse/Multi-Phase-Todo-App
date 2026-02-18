import { configureStore, Middleware } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { logout } from './slices/authSlice';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import tagsReducer from './slices/tagsSlice';
import uiReducer from './slices/uiSlice';
import agentChatReducer from './slices/agentChat';

// Middleware to handle 401 errors globally
const unauthenticatedMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  // Check if this is a rejected action with 401 status
  // Exclude login action from automatic redirect to allow proper error handling in the component
  if (typeof action.type === 'string' &&
      action.type.endsWith('/rejected') &&
      action.payload?.status === 401 &&
      !action.type.startsWith('auth/login') &&
      !action.type.startsWith('auth/fetchProfile')) {
    // Dispatch logout action to clear user state
    storeAPI.dispatch(logout());
    // Optionally redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  return next(action);
};

// Configure Redux Persist for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated', 'token'], // Only persist these fields
};

// Configure Redux Persist for tags slice
const tagsPersistConfig = {
  key: 'tags',
  storage,
  // Remove whitelist to persist the entire state of the tags slice
  // This ensures all properties (tags, loading, error) are persisted
};

// Configure Redux Persist for tasks slice
const tasksPersistConfig = {
  key: 'tasks',
  storage,
  // Only persist tasks array, not loading/error state
  whitelist: ['tasks'],
};

// Configure Redux Persist for agentChat slice
const agentChatPersistConfig = {
  key: 'agentChat',
  storage,
  // Only persist conversations and currentConversationId, not transient states
  whitelist: ['conversations', 'currentConversationId'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedTagsReducer = persistReducer(tagsPersistConfig, tagsReducer);
const persistedTasksReducer = persistReducer(tasksPersistConfig, tasksReducer);
const persistedAgentChatReducer = persistReducer(agentChatPersistConfig, agentChatReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    tasks: persistedTasksReducer,
    tags: persistedTagsReducer,
    ui: uiReducer,
    agentChat: persistedAgentChatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(unauthenticatedMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export default store;