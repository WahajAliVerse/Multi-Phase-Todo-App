import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './slices/taskSlice';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import tagReducer from './slices/tagSlice';
import recurrenceReducer from './slices/recurrenceSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    auth: authReducer,
    user: userReducer,
    tags: tagReducer,
    recurrence: recurrenceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;