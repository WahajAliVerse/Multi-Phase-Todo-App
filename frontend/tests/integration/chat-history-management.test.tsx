/**
 * Integration Tests for Conversation History Management (US7)
 * 
 * Tests the complete conversation management workflow including:
 * - Viewing conversation history
 * - Searching conversations
 * - Deleting individual conversations
 * - Clearing all history with confirmation
 * 
 * @module frontend/tests/integration/chat-history-management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ChatModal from '@/components/common/ChatModal';
import agentChatReducer from '@/redux/slices/agentChat';
import authReducer from '@/redux/slices/auth';

// Mock the API calls
vi.mock('@/utils/api', () => ({
  chatApi: {
    sendMessage: vi.fn(),
    getConversations: vi.fn(),
    getMessages: vi.fn(),
    createConversation: vi.fn(),
    updateConversation: vi.fn(),
    deleteConversation: vi.fn(),
  },
}));

// Mock framer-motion for simpler testing
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    input: 'input',
    textarea: 'textarea',
    header: 'header',
    p: 'p',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Test data
const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  authenticationStatus: 'authenticated' as const,
};

const mockConversations = [
  {
    id: 'conv-1',
    userId: mockUser.id,
    title: 'Grocery Shopping List',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    isActive: true,
  },
  {
    id: 'conv-2',
    userId: mockUser.id,
    title: 'Meeting Notes - Project Alpha',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isActive: true,
  },
  {
    id: 'conv-3',
    userId: mockUser.id,
    title: 'Weekend Plans',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    isActive: true,
  },
];

const mockMessages = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    role: 'user' as const,
    content: 'Create a grocery list',
    timestamp: new Date().toISOString(),
    status: 'delivered' as const,
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    role: 'assistant' as const,
    content: 'I\'ve created a grocery list for you. What items would you like to add?',
    timestamp: new Date().toISOString(),
    status: 'delivered' as const,
  },
];

// Helper to create test store
const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      agentChat: agentChatReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        token: 'test-token',
        loading: false,
        error: null,
      },
      agentChat: {
        messages: [],
        conversations: [],
        currentConversationId: null,
        isLoading: false,
        isSending: false,
        error: null,
        typingIndicator: false,
        ...preloadedState?.agentChat,
      },
      ...preloadedState,
    },
  });
};

// Helper to render component with providers
const renderChatModal = (store: ReturnType<typeof createTestStore>) => {
  return render(
    <Provider store={store}>
      <ChatModal isOpen={true} onClose={() => {}} />
    </Provider>
  );
};

describe('Conversation History Management (US7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('T092 - Conversation List UI', () => {
    it('should display conversation list when toggle button is clicked', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      // Click the conversation list toggle button
      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      // Wait for conversation list to appear
      await waitFor(() => {
        expect(screen.getByText('Conversations')).toBeInTheDocument();
      });

      // Verify conversations are displayed
      expect(screen.getByText('Grocery Shopping List')).toBeInTheDocument();
      expect(screen.getByText('Meeting Notes - Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Weekend Plans')).toBeInTheDocument();
    });

    it('should show "No conversations yet" when list is empty', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: [],
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Conversations')).toBeInTheDocument();
      });

      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });

    it('should display New Chat button', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('New Chat')).toBeInTheDocument();
      });
    });
  });

  describe('T093 - Delete Conversation Button', () => {
    it('should show delete button on hover for each conversation', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Grocery Shopping List')).toBeInTheDocument();
      });

      // Find the conversation item
      const conversationItem = screen.getByText('Grocery Shopping List').closest('[role="listitem"]') 
        || screen.getByText('Grocery Shopping List').closest('div');
      
      if (conversationItem) {
        // Simulate hover by adding the group-hover class behavior
        fireEvent.mouseEnter(conversationItem);

        // Wait for delete button to appear
        await waitFor(() => {
          const deleteButtons = screen.getAllByLabelText('Delete conversation');
          expect(deleteButtons.length).toBeGreaterThan(0);
        });
      }
    });

    it('should show confirmation dialog when delete is clicked', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Grocery Shopping List')).toBeInTheDocument();
      });

      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = vi.fn(() => true);

      // Click delete button (we need to find it by its icon)
      const deleteButtons = screen.getAllByRole('button', { name: /delete conversation/i });
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
        
        expect(window.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete this conversation?'
        );
      }

      window.confirm = originalConfirm;
    });
  });

  describe('T094 - Clear All History Confirmation Dialog', () => {
    it('should display Clear All button when conversations exist', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Clear All')).toBeInTheDocument();
      });
    });

    it('should not display Clear All button when no conversations exist', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: [],
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when Clear All is clicked', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Clear All')).toBeInTheDocument();
      });

      // Click Clear All button
      const clearAllButton = screen.getByText('Clear All');
      fireEvent.click(clearAllButton);

      // Wait for confirmation dialog
      await waitFor(() => {
        expect(screen.getByText('Clear All History')).toBeInTheDocument();
      });

      // Verify dialog content
      expect(
        screen.getByText(/Are you sure you want to delete all 3 conversations?/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/This action will soft-delete all your conversations/i)
      ).toBeInTheDocument();
    });

    it('should close dialog when Cancel is clicked', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      const clearAllButton = screen.getByText('Clear All');
      fireEvent.click(clearAllButton);

      await waitFor(() => {
        expect(screen.getByText('Clear All History')).toBeInTheDocument();
      });

      // Click Cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText('Clear All History')).not.toBeInTheDocument();
      });
    });

    it('should delete all conversations when confirmed', async () => {
      const { chatApi } = await import('@/utils/api');
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      const clearAllButton = screen.getByText('Clear All');
      fireEvent.click(clearAllButton);

      await waitFor(() => {
        expect(screen.getByText('Clear All History')).toBeInTheDocument();
      });

      // Click Delete All
      const deleteAllButton = screen.getByText(/Delete All \(3\)/i);
      fireEvent.click(deleteAllButton);

      // Verify deleteConversation was called for each conversation
      await waitFor(() => {
        expect(chatApi.deleteConversation).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('T095 - Conversation Search UI', () => {
    it('should display search input in conversation list', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search conversations...');
        expect(searchInput).toBeInTheDocument();
      });
    });

    it('should filter conversations based on search query', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Grocery Shopping List')).toBeInTheDocument();
      });

      // Type in search input
      const searchInput = screen.getByPlaceholderText('Search conversations...');
      fireEvent.change(searchInput, { target: { value: 'grocery' } });

      // Should only show matching conversation
      await waitFor(() => {
        expect(screen.getByText('Grocery Shopping List')).toBeInTheDocument();
        expect(screen.queryByText('Meeting Notes - Project Alpha')).not.toBeInTheDocument();
        expect(screen.queryByText('Weekend Plans')).not.toBeInTheDocument();
      });
    });

    it('should show "no results" message when search has no matches', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      const searchInput = screen.getByPlaceholderText('Search conversations...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(
          screen.getByText('No conversations matching "nonexistent"')
        ).toBeInTheDocument();
      });
    });

    it('should clear search when X button is clicked', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      const searchInput = screen.getByPlaceholderText('Search conversations...');
      fireEvent.change(searchInput, { target: { value: 'grocery' } });

      await waitFor(() => {
        expect(screen.getByText('Grocery Shopping List')).toBeInTheDocument();
      });

      // Click clear button
      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      // Search should be cleared and all conversations shown
      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.getByText('Meeting Notes - Project Alpha')).toBeInTheDocument();
      });
    });

    it('should show conversation count footer', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText(/3 conversations/i)).toBeInTheDocument();
      });
    });

    it('should update count when filtering', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      const searchInput = screen.getByPlaceholderText('Search conversations...');
      fireEvent.change(searchInput, { target: { value: 'grocery' } });

      await waitFor(() => {
        expect(screen.getByText(/1 of 3 conversations/i)).toBeInTheDocument();
      });
    });
  });

  describe('T087 - Integration: Complete Conversation Management Flow', () => {
    it('should complete full conversation management workflow', async () => {
      const { chatApi } = await import('@/utils/api');
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
          messages: mockMessages,
        },
      });

      renderChatModal(store);

      // Step 1: Open conversation list
      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Conversations')).toBeInTheDocument();
      });

      // Step 2: Search for a conversation
      const searchInput = screen.getByPlaceholderText('Search conversations...');
      fireEvent.change(searchInput, { target: { value: 'Meeting' } });

      await waitFor(() => {
        expect(screen.getByText('Meeting Notes - Project Alpha')).toBeInTheDocument();
      });

      // Step 3: Select conversation
      const conversationItem = screen.getByText('Meeting Notes - Project Alpha');
      fireEvent.click(conversationItem);

      // Step 4: Delete the selected conversation
      fireEvent.click(toggleButton);

      // Clear search first
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        const deleteButtons = screen.getAllByLabelText('Delete conversation');
        if (deleteButtons.length > 0) {
          const originalConfirm = window.confirm;
          window.confirm = vi.fn(() => true);
          fireEvent.click(deleteButtons[0]);
          expect(window.confirm).toHaveBeenCalled();
          window.confirm = originalConfirm;
        }
      });

      // Verify API call was made
      await waitFor(() => {
        expect(chatApi.deleteConversation).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for conversation list', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      expect(toggleButton).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA labels for delete buttons', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const deleteButtons = screen.getAllByLabelText('Delete conversation');
        deleteButtons.forEach((button) => {
          expect(button).toHaveAttribute('aria-label', 'Delete conversation');
        });
      });
    });

    it('should be keyboard navigable', async () => {
      const store = createTestStore({
        agentChat: {
          conversations: mockConversations,
        },
      });

      renderChatModal(store);

      const toggleButton = screen.getByLabelText('Toggle conversation list');
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Conversations')).toBeInTheDocument();
      });

      // Tab to search input
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      
      // Search input should be focused
      const searchInput = screen.getByPlaceholderText('Search conversations...');
      expect(searchInput).toBeInTheDocument();
    });
  });
});
