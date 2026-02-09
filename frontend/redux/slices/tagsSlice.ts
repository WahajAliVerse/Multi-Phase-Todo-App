import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tagsApi } from '@/utils/api';
import { Tag, CreateTagData, UpdateTagData } from '@/utils/validators';
import { TagsState } from '@/types';

// Initial state
const initialState: TagsState = {
  tags: [],
  loading: false,
  error: null,
};

// Async thunks for tags
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tagsApi.getAll();
      return response.tags;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createTag = createAsyncThunk(
  'tags/createTag',
  async (tagData: CreateTagData & { userId?: string }, { rejectWithValue, getState }) => {
    try {
      // If userId is not provided in tagData, get it from the auth state
      const finalTagData = tagData.userId 
        ? tagData 
        : { ...tagData, userId: (getState() as any).auth.user?.id };
      
      const response = await tagsApi.create(finalTagData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async ({ id, tagData }: { id: string; tagData: UpdateTagData }, { rejectWithValue }) => {
    try {
      const response = await tagsApi.update(id, tagData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (id: string, { rejectWithValue }) => {
    try {
      await tagsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Tags slice
const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tags
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create tag
      .addCase(createTag.fulfilled, (state, action) => {
        state.tags.push(action.payload);
        state.loading = false;
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update tag
      .addCase(updateTag.fulfilled, (state, action) => {
        const index = state.tags.findIndex(tag => tag.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete tag
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = tagsSlice.actions;
export default tagsSlice.reducer;