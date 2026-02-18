import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatApi } from '@/utils/api';
import {
  ChatState,
  ChatMessage,
  ChatConversation,
  ChatMessageStatus,
  SendMessageRequest,
  ChatAction,
} from '@/types';

// ============================================================================
// Initial State
// ============================================================================

const initialState: ChatState = {
  messages: [],
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  isSending: false,
  error: null,
  typingIndicator: false,
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Send a message to the AI assistant
 * Handles both new conversations and existing ones
 */
export const sendMessage = createAsyncThunk(
  'agentChat/sendMessage',
  async (request: SendMessageRequest & { content: string }, { rejectWithValue, getState }) => {
    try {
      const response = await chatApi.sendMessage(request);
      return response;
    } catch (error: any) {
      console.error('[agentChat/sendMessage] Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to send message');
    }
  }
);

/**
 * Fetch all conversations for the current user
 */
export const fetchConversations = createAsyncThunk(
  'agentChat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatApi.getConversations();
      return response;
    } catch (error: any) {
      console.error('[agentChat/fetchConversations] Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch conversations');
    }
  }
);

/**
 * Fetch messages for a specific conversation
 */
export const fetchMessages = createAsyncThunk(
  'agentChat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await chatApi.getMessages(conversationId);
      return response;
    } catch (error: any) {
      console.error('[agentChat/fetchMessages] Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch messages');
    }
  }
);

/**
 * Create a new conversation
 */
export const createConversation = createAsyncThunk(
  'agentChat/createConversation',
  async (title: string, { rejectWithValue }) => {
    try {
      const response = await chatApi.createConversation(title);
      return response;
    } catch (error: any) {
      console.error('[agentChat/createConversation] Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create conversation');
    }
  }
);

/**
 * Delete a conversation
 */
export const deleteConversation = createAsyncThunk(
  'agentChat/deleteConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await chatApi.deleteConversation(conversationId);
      return conversationId;
    } catch (error: any) {
      console.error('[agentChat/deleteConversation] Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete conversation');
    }
  }
);

/**
 * Update a conversation title
 */
export const updateConversation = createAsyncThunk(
  'agentChat/updateConversation',
  async ({ conversationId, title }: { conversationId: string; title: string }, { rejectWithValue }) => {
    try {
      const response = await chatApi.updateConversation(conversationId, title);
      return response;
    } catch (error: any) {
      console.error('[agentChat/updateConversation] Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update conversation');
    }
  }
);

// ============================================================================
// Chat Slice
// ============================================================================

const agentChatSlice = createSlice({
  name: 'agentChat',
  initialState,
  reducers: {
    /**
     * Receive a message from the assistant (for real-time updates)
     */
    receiveMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
      state.isSending = false;
      state.typingIndicator = false;
    },

    /**
     * Clear all chat history for the current conversation
     */
    clearHistory: (state) => {
      state.messages = [];
      state.error = null;
    },

    /**
     * Set the current active conversation
     */
    setConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload;
      state.messages = [];
      state.error = null;
    },

    /**
     * Update message status (for optimistic updates)
     */
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; status: ChatMessageStatus }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId);
      if (message) {
        message.status = action.payload.status;
      }
    },

    /**
     * Set typing indicator state
     */
    setTypingIndicator: (state, action: PayloadAction<boolean>) => {
      state.typingIndicator = action.payload;
    },

    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Add actions extracted from a message
     */
    addMessageActions: (state, action: PayloadAction<{ messageId: string; actions: ChatAction[] }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId);
      if (message) {
        message.actions = [...(message.actions || []), ...action.payload.actions];
      }
    },

    /**
     * Confirm a chat action (e.g., user confirmed task creation)
     */
    confirmAction: (state, action: PayloadAction<{ messageId: string; actionIndex: number }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId);
      if (message?.actions?.[action.payload.actionIndex]) {
        message.actions[action.payload.actionIndex].confirmed = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ========================================================================
      // Send Message
      // ========================================================================
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        
        // Add the sent message to the conversation
        if (action.payload.message) {
          state.messages.push(action.payload.message);
        }
        
        // Update conversation if provided
        if (action.payload.conversation) {
          const existingIndex = state.conversations.findIndex(
            (c) => c.id === action.payload.conversation!.id
          );
          if (existingIndex !== -1) {
            state.conversations[existingIndex] = action.payload.conversation;
          } else {
            state.conversations.push(action.payload.conversation);
          }
          
          // Set as current conversation if not already set
          if (!state.currentConversationId) {
            state.currentConversationId = action.payload.conversation.id;
          }
        }
        
        // Add any extracted actions to the message
        if (action.payload.actions && action.payload.message) {
          const message = state.messages.find((m) => m.id === action.payload.message!.id);
          if (message) {
            message.actions = action.payload.actions;
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
        state.typingIndicator = false;
      })

      // ========================================================================
      // Fetch Conversations
      // ========================================================================
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========================================================================
      // Fetch Messages
      // ========================================================================
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        
        // Update conversation info if provided
        if (action.payload.conversation) {
          state.currentConversationId = action.payload.conversation.id;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ========================================================================
      // Create Conversation
      // ========================================================================
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.push(action.payload);
        state.currentConversationId = action.payload.id;
        state.messages = []; // Clear messages for new conversation
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ========================================================================
      // Delete Conversation
      // ========================================================================
      .addCase(deleteConversation.fulfilled, (state, action) => {
        // Remove conversation from list
        state.conversations = state.conversations.filter(
          (c) => c.id !== action.payload
        );
        
        // If deleted conversation was active, clear it
        if (state.currentConversationId === action.payload) {
          state.currentConversationId = null;
          state.messages = [];
        }
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ========================================================================
      // Update Conversation
      // ========================================================================
      .addCase(updateConversation.fulfilled, (state, action) => {
        const index = state.conversations.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.conversations[index] = action.payload;
        }
      })
      .addCase(updateConversation.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ========================================================================
      // Handle Rehydration from Redux Persist
      // ========================================================================
      .addMatcher(
        (action) => action.type === 'persist/REHYDRATE' && (action as any).payload?.agentChat,
        (state, action) => {
          const rehydratedChat = (action as any).payload.agentChat;
          if (rehydratedChat) {
            // Only restore non-transient state
            state.conversations = rehydratedChat.conversations || [];
            state.currentConversationId = rehydratedChat.currentConversationId || null;
            // Don't restore messages, loading states, or errors - fetch fresh on load
            state.messages = [];
            state.isLoading = false;
            state.isSending = false;
            state.error = null;
            state.typingIndicator = false;
          }
        }
      );
  },
});

// ============================================================================
// Exports
// ============================================================================

export const {
  receiveMessage,
  clearHistory,
  setConversation,
  updateMessageStatus,
  setTypingIndicator,
  clearError,
  addMessageActions,
  confirmAction,
} = agentChatSlice.actions;

export default agentChatSlice.reducer;
