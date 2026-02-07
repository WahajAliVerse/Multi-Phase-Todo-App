import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tag } from '@/lib/types';
import { tagApi } from '@/api/tagApi';

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  currentTag: Tag | null;
}

const initialState: TagState = {
  tags: [],
  loading: false,
  error: null,
  currentTag: null,
};

const tagSlice = createSlice({
  name: 'tag',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.tags = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTag: (state, action: PayloadAction<Tag>) => {
      state.tags.push(action.payload);
    },
    updateTag: (state, action: PayloadAction<Tag>) => {
      const index = state.tags.findIndex(tag => tag.id === action.payload.id);
      if (index !== -1) {
        state.tags[index] = action.payload;
      }
    },
    deleteTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter(tag => tag.id !== action.payload);
    },
    setCurrentTag: (state, action: PayloadAction<Tag | null>) => {
      state.currentTag = action.payload;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  setTags, 
  addTag, 
  updateTag, 
  deleteTag, 
  setCurrentTag 
} = tagSlice.actions;

export default tagSlice.reducer;