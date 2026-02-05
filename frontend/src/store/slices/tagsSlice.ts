import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tag } from '../../lib/types';

// Define the initial state
interface TagsState {
  tags: Tag[];
  selectedTag: Tag | null;
  loading: boolean;
  error: string | null;
}

const initialState: TagsState = {
  tags: [],
  selectedTag: null,
  loading: false,
  error: null,
};

// Create the slice
export const tagsSlice = createSlice({
  name: 'tags',
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

    // Add or update a tag
    addOrUpdateTag: (state, action: PayloadAction<Tag>) => {
      const index = state.tags.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tags[index] = action.payload;
      } else {
        state.tags.push(action.payload);
      }
      state.selectedTag = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set multiple tags
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.tags = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Remove a tag
    removeTag: (state, action: PayloadAction<number>) => {
      state.tags = state.tags.filter(tag => tag.id !== action.payload);
      if (state.selectedTag?.id === action.payload) {
        state.selectedTag = null;
      }
    },

    // Select a tag
    selectTag: (state, action: PayloadAction<Tag | null>) => {
      state.selectedTag = action.payload;
    },

    // Clear selected tag
    clearSelectedTag: (state) => {
      state.selectedTag = null;
    },

    // Update tag properties
    updateTag: (state, action: PayloadAction<{ id: number; updates: Partial<Tag> }>) => {
      const { id, updates } = action.payload;
      const tagIndex = state.tags.findIndex(tag => tag.id === id);
      if (tagIndex !== -1) {
        state.tags[tagIndex] = { ...state.tags[tagIndex], ...updates };
        if (state.selectedTag?.id === id) {
          state.selectedTag = { ...state.selectedTag, ...updates };
        }
      }
    },

    // Reset state
    reset: (state) => {
      state.tags = [];
      state.selectedTag = null;
      state.loading = false;
      state.error = null;
    },
  },
});

// Export the actions
export const {
  setLoading,
  setError,
  addOrUpdateTag,
  setTags,
  removeTag,
  selectTag,
  clearSelectedTag,
  updateTag,
  reset,
} = tagsSlice.actions;

// Export the reducer
export default tagsSlice.reducer;