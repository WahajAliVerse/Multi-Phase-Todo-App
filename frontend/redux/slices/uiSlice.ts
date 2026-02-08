import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UiState, Notification, ModalState } from '@/types';

// Initial state
const initialState: UiState = {
  notifications: [],
  modal: {
    mode: 0, // 0 = create, 1 = edit
    entityType: 'task',
    isOpen: false,
  },
  loading: false,
  error: null,
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const newNotification: Notification = {
        id: Math.random().toString(36).substring(2, 9),
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(newNotification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notification => notification.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modal
    openModal: (state, action: PayloadAction<{ mode: ModalState['mode']; entityType: ModalState['entityType']; entityId?: string }>) => {
      state.modal = {
        mode: action.payload.mode,
        entityType: action.payload.entityType,
        entityId: action.payload.entityId,
        isOpen: true,
      };
    },
    closeModal: (state) => {
      state.modal = {
        mode: 0,
        entityType: 'task',
        isOpen: false,
      };
    },
    
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  addNotification, 
  removeNotification, 
  clearNotifications, 
  openModal, 
  closeModal, 
  setLoading, 
  setError, 
  clearError 
} = uiSlice.actions;
export default uiSlice.reducer;