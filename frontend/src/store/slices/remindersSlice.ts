import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Reminder } from '../../lib/types';

// Define the initial state
interface RemindersState {
  reminders: Reminder[];
  selectedReminder: Reminder | null;
  loading: boolean;
  error: string | null;
}

const initialState: RemindersState = {
  reminders: [],
  selectedReminder: null,
  loading: false,
  error: null,
};

// Create the slice
export const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Add or update a reminder
    addOrUpdateReminder: (state, action: PayloadAction<Reminder>) => {
      const index = state.reminders.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reminders[index] = action.payload;
      } else {
        state.reminders.push(action.payload);
      }
      state.selectedReminder = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set multiple reminders
    setReminders: (state, action: PayloadAction<Reminder[]>) => {
      state.reminders = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Remove a reminder
    removeReminder: (state, action: PayloadAction<number>) => {
      state.reminders = state.reminders.filter(reminder => reminder.id !== action.payload);
      if (state.selectedReminder?.id === action.payload) {
        state.selectedReminder = null;
      }
    },

    // Select a reminder
    selectReminder: (state, action: PayloadAction<Reminder | null>) => {
      state.selectedReminder = action.payload;
    },

    // Clear selected reminder
    clearSelectedReminder: (state) => {
      state.selectedReminder = null;
    },

    // Update reminder status
    updateReminderStatus: (state, action: PayloadAction<{ id: number; status: 'pending' | 'sent' | 'delivered' | 'failed' }>) => {
      const { id, status } = action.payload;
      const reminder = state.reminders.find(r => r.id === id);
      if (reminder) {
        reminder.deliveryStatus = status;
        if (state.selectedReminder?.id === id) {
          state.selectedReminder.deliveryStatus = status;
        }
      }
    },

    // Reset state
    reset: (state) => {
      state.reminders = [];
      state.selectedReminder = null;
      state.loading = false;
      state.error = null;
    },
  },
});

// Export the actions
export const {
  setLoading,
  setError,
  addOrUpdateReminder,
  setReminders,
  removeReminder,
  selectReminder,
  clearSelectedReminder,
  updateReminderStatus,
  reset,
} = remindersSlice.actions;

// Export the reducer
export default remindersSlice.reducer;