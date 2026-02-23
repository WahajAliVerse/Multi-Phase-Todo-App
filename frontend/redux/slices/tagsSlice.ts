import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tagsApi } from '@/utils/api';
import { Tag, CreateTagData, UpdateTagData } from '@/utils/validators';
import { TagsState } from '@/types';
import { sendMessage } from './agentChat';
import { ChatAction } from '@/types';

// ============================================================================
// Helper Functions for Auto-Update from Chat Actions
// ============================================================================

/**
 * Extract tag data from a chat action result
 * Handles both snake_case (backend) and camelCase (frontend) formats
 */
const extractTagFromChatAction = (action: ChatAction): Partial<Tag> | null => {
  if (!action.details) return null;

  const details = action.details;
  const tagData = details.tag || details;

  // Convert snake_case to camelCase if needed
  const tag: Partial<Tag> = {
    id: tagData.id || action.tag_id,
    name: tagData.name,
    color: tagData.color,
    userId: tagData.user_id || tagData.userId,
    createdAt: tagData.created_at || tagData.createdAt || new Date().toISOString(),
    updatedAt: tagData.updated_at || tagData.updatedAt || new Date().toISOString(),
  };

  return tag.id ? tag : null;
};

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
      // ======================================================================
      // AUTO-UPDATE FROM CHAT ACTIONS (Redux Auto-Sync Feature)
      // When chat operations create/update/delete tags, automatically update
      // the tags state without requiring a page refresh or re-fetch
      // ======================================================================
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Extract actions from the chat response
        const chatActions = action.payload.actions || [];

        chatActions.forEach((chatAction: ChatAction) => {
          // Only process confirmed actions (backend has already executed them)
          if (!chatAction.confirmed) return;

          // Handle tag creation
          if (chatAction.type === 'create_tag') {
            const newTag = extractTagFromChatAction(chatAction);
            if (newTag && newTag.id) {
              const existingIndex = state.tags.findIndex(t => t.id === newTag.id);
              if (existingIndex === -1) {
                state.tags.push(newTag as Tag);
                console.log('[tagsSlice] Auto-added tag from chat:', newTag.id);
              }
            }
          }

          // Handle tag update
          if (chatAction.type === 'update_tag' && chatAction.tag_id) {
            const updatedTag = extractTagFromChatAction(chatAction);
            if (updatedTag && updatedTag.id) {
              const index = state.tags.findIndex(t => t.id === updatedTag.id);
              if (index !== -1) {
                state.tags[index] = { ...state.tags[index], ...updatedTag } as Tag;
                console.log('[tagsSlice] Auto-updated tag from chat:', updatedTag.id);
              }
            }
          }

          // Handle tag deletion
          if (chatAction.type === 'delete_tag' && chatAction.tag_id) {
            const initialCount = state.tags.length;
            state.tags = state.tags.filter(t => t.id !== chatAction.tag_id);
            if (state.tags.length !== initialCount) {
              console.log('[tagsSlice] Auto-deleted tag from chat:', chatAction.tag_id);
            }
          }
        });
      })

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