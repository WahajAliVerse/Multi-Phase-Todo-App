import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/lib/types';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => n.status !== 'read').length;
      state.loading = false;
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (action.payload.status !== 'read') {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(notification => notification.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
        // Update unread count
        state.unreadCount = state.notifications.filter(n => n.status !== 'read').length;
      }
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notification => notification.id !== action.payload);
      state.unreadCount = state.notifications.filter(n => n.status !== 'read').length;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.status = 'read';
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (notification.status !== 'read') {
          notification.status = 'read';
        }
      });
      state.unreadCount = 0;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  setNotifications, 
  addNotification, 
  updateNotification, 
  deleteNotification, 
  markAsRead, 
  markAllAsRead 
} = notificationSlice.actions;

export default notificationSlice.reducer;