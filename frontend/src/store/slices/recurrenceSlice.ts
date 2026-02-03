import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RecurrencePattern } from '../../lib/types';

// Define the initial state
interface RecurrenceState {
  patterns: RecurrencePattern[];
  selectedPattern: RecurrencePattern | null;
  loading: boolean;
  error: string | null;
}

const initialState: RecurrenceState = {
  patterns: [],
  selectedPattern: null,
  loading: false,
  error: null,
};

// Create the slice
export const recurrenceSlice = createSlice({
  name: 'recurrence',
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

    // Add or update a recurrence pattern
    addOrUpdatePattern: (state, action: PayloadAction<RecurrencePattern>) => {
      const index = state.patterns.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.patterns[index] = action.payload;
      } else {
        state.patterns.push(action.payload);
      }
      state.selectedPattern = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set multiple patterns
    setPatterns: (state, action: PayloadAction<RecurrencePattern[]>) => {
      state.patterns = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Remove a pattern
    removePattern: (state, action: PayloadAction<number>) => {
      state.patterns = state.patterns.filter(pattern => pattern.id !== action.payload);
      if (state.selectedPattern?.id === action.payload) {
        state.selectedPattern = null;
      }
    },

    // Select a pattern
    selectPattern: (state, action: PayloadAction<RecurrencePattern | null>) => {
      state.selectedPattern = action.payload;
    },

    // Clear selected pattern
    clearSelectedPattern: (state) => {
      state.selectedPattern = null;
    },

    // Reset state
    reset: (state) => {
      state.patterns = [];
      state.selectedPattern = null;
      state.loading = false;
      state.error = null;
    },
  },
});

// Export the actions
export const {
  setLoading,
  setError,
  addOrUpdatePattern,
  setPatterns,
  removePattern,
  selectPattern,
  clearSelectedPattern,
  reset,
} = recurrenceSlice.actions;

// Export the reducer
export default recurrenceSlice.reducer;