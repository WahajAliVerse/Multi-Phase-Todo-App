import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TagState {
  tags: any[]; // In a real app, you'd have a Tag type
  loading: boolean;
  error: string | null;
}

const initialState: TagState = {
  tags: [],
  loading: false,
  error: null,
};

const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    setTags: (state, action: PayloadAction<any[]>) => {
      state.tags = action.payload;
    },
    addTag: (state, action: PayloadAction<any>) => {
      state.tags.push(action.payload);
    },
    updateTag: (state, action: PayloadAction<any>) => {
      const index = (state.tags || []).findIndex(tag => tag.id === action.payload.id);
      if (index !== -1) {
        state.tags[index] = action.payload;
      }
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags?.filter(tag => tag.id !== action.payload) || [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setTags, addTag, updateTag, removeTag, setLoading, setError } = tagSlice.actions;

export default tagSlice.reducer;