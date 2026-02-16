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
    console.log('fetchTags action initiated');
    try {
      const response = await tagsApi.getAll();
      console.log('fetchTags received response:', response);
      console.log('fetchTags response type:', typeof response);
      console.log('fetchTags response isArray:', Array.isArray(response));
      // The response is already the array of tags, not an object with a tags property
      return response;
    } catch (error: any) {
      console.error('fetchTags error:', error);
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
      // Handle rehydration from Redux Persist
      .addCase('persist/REHYDRATE', (state, action: any) => {
        const incomingState = action.payload;
        if (incomingState && Array.isArray(incomingState.tags)) {
          // Only update if the incoming state has tags and the current state is empty
          if (!state.tags || state.tags.length === 0) {
            state.tags = incomingState.tags;
          }
        }
        // Maintain loading and error states
        state.loading = false;
      })
      // Fetch tags
      .addCase(fetchTags.pending, (state) => {
        console.log('fetchTags pending - setting loading to true');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        console.log('fetchTags fulfilled - updating state with payload:', action.payload);
        console.log('Before update - state.tags:', state.tags);
        state.loading = false;
        // Ensure the payload is an array before assigning
        state.tags = Array.isArray(action.payload) ? action.payload : [];
        console.log('After update - state.tags:', state.tags);
      })
      .addCase(fetchTags.rejected, (state, action) => {
        console.log('fetchTags rejected - setting error:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create tag
      .addCase(createTag.fulfilled, (state, action) => {
        // Ensure tags is an array before pushing
        if (!Array.isArray(state.tags)) {
          state.tags = [];
        }
        state.tags.push(action.payload);
        state.loading = false;
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update tag
      .addCase(updateTag.fulfilled, (state, action) => {
        // Ensure tags is an array before accessing
        if (!Array.isArray(state.tags)) {
          state.tags = [];
        }
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
        // Ensure tags is an array before filtering
        if (!Array.isArray(state.tags)) {
          state.tags = [];
        }
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