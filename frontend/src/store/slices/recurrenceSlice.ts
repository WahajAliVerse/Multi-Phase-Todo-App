import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RecurrenceState {
  patterns: any[]; // In a real app, you'd have a RecurrencePattern type
  loading: boolean;
  error: string | null;
}

const initialState: RecurrenceState = {
  patterns: [],
  loading: false,
  error: null,
};

const recurrenceSlice = createSlice({
  name: 'recurrence',
  initialState,
  reducers: {
    setPatterns: (state, action: PayloadAction<any[]>) => {
      state.patterns = action.payload;
    },
    addPattern: (state, action: PayloadAction<any>) => {
      state.patterns.push(action.payload);
    },
    updatePattern: (state, action: PayloadAction<any>) => {
      const index = (state.patterns || []).findIndex(pattern => pattern.id === action.payload.id);
      if (index !== -1) {
        state.patterns[index] = action.payload;
      }
    },
    removePattern: (state, action: PayloadAction<string>) => {
      state.patterns = state.patterns?.filter(pattern => pattern.id !== action.payload) || [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setPatterns, addPattern, updatePattern, removePattern, setLoading, setError } = recurrenceSlice.actions;

export default recurrenceSlice.reducer;