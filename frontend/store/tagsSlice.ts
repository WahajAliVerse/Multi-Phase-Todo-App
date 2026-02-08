import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Tag, 
  CreateTagRequest, 
  UpdateTagRequest,
  ApiError 
} from '@/types/api';
import { apiService } from '@/services/api';

// Async thunks for tags
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getTags();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tags');
    }
  }
);

export const createTag = createAsyncThunk(
  'tags/createTag',
  async (tagData: CreateTagRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.createTag(tagData);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create tag');
    }
  }
);

export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async ({ id, tagData }: { id: string; tagData: UpdateTagRequest }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTag(id, tagData);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update tag');
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteTag(id);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete tag');
    }
  }
);

interface TagsState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: TagsState = {
  tags: [],
  loading: false,
  error: null,
  successMessage: null,
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearTagsError: (state) => {
      state.error = null;
    },
    clearTagsSuccessMessage: (state) => {
      state.successMessage = null;
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
        state.error = action.payload as string || 'Failed to fetch tags';
      })
      // Create tag
      .addCase(createTag.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags.push(action.payload);
        state.successMessage = 'Tag created successfully';
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create tag';
      })
      // Update tag
      .addCase(updateTag.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tags.findIndex(tag => tag.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        state.successMessage = 'Tag updated successfully';
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update tag';
      })
      // Delete tag
      .addCase(deleteTag.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
        state.successMessage = 'Tag deleted successfully';
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete tag';
      });
  },
});

export const { clearTagsError, clearTagsSuccessMessage } = tagsSlice.actions;
export default tagsSlice.reducer;