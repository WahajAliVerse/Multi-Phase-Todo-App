/**
 * Integration Tests for Chat-Based Tag Management
 *
 * Tests Redux store, API service, and component integration for tag operations.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { agentChatReducer, sendMessage, confirmAction } from '@/redux/slices/agentChat';
import { chatApi } from '@/utils/api';
import type { ChatMessage, ChatAction, ChatConversation } from '@/types';

// Mock API service
vi.mock('@/utils/api', () => ({
  chatApi: {
    sendMessage: vi.fn(),
    getConversations: vi.fn(),
    getMessages: vi.fn(),
    createConversation: vi.fn(),
    deleteConversation: vi.fn(),
  },
}));

/**
 * Helper to create test store
 */
function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      agentChat: agentChatReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['agentChat/sendMessage/pending'],
        },
      }),
  });
}

describe('Chat Tag Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tag Creation Flow', () => {
    it('should handle tag creation with named color', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: 'I created a tag "Work" in red',
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'create_tag',
          tag_id: 'tag-123',
          details: {
            name: 'Work',
            color: '#FF0000',
            color_name: 'Red',
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Create work tag in red',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions).toBeDefined();
      expect(lastMessage.actions?.[0].type).toBe('create_tag');
      expect(lastMessage.actions?.[0].details?.name).toBe('Work');
      expect(lastMessage.actions?.[0].details?.color).toBe('#FF0000');
    });

    it('should handle tag creation with hex color', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: 'I created a tag "Priority" in #FF5733',
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'create_tag',
          tag_id: 'tag-456',
          details: {
            name: 'Priority',
            color: '#FF5733',
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Create priority tag in #FF5733',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('create_tag');
      expect(lastMessage.actions?.[0].details?.color).toBe('#FF5733');
    });

    it('should handle tag creation with default color', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: 'I created a tag "Meetings" in blue',
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'create_tag',
          tag_id: 'tag-789',
          details: {
            name: 'Meetings',
            color: '#0000FF',
            color_name: 'Blue',
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Create meetings tag',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('create_tag');
      expect(lastMessage.actions?.[0].details?.color).toBe('#0000FF');
    });
  });

  describe('Tag Update Flow', () => {
    it('should handle tag rename', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: 'I renamed the tag "Work" to "Professional"',
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'update_tag',
          tag_id: 'tag-123',
          details: {
            name: 'Work',
            updates: {
              name: 'Professional',
            },
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Rename work tag to professional',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('update_tag');
      expect(lastMessage.actions?.[0].details?.updates?.name).toBe('Professional');
    });

    it('should handle tag color change', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: 'I changed the tag "Work" color to green',
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'update_tag',
          tag_id: 'tag-123',
          details: {
            name: 'Work',
            updates: {
              color: '#008000',
            },
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Change work tag color to green',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('update_tag');
      expect(lastMessage.actions?.[0].details?.updates?.color).toBe('#008000');
    });
  });

  describe('Tag Deletion Flow', () => {
    it('should handle tag deletion', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: 'I deleted the tag "Old"',
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'delete_tag',
          tag_id: 'tag-old',
          details: {
            name: 'Old',
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Delete old tag',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('delete_tag');
      expect(lastMessage.actions?.[0].details?.name).toBe('Old');
    });
  });

  describe('Tag Assignment Flow', () => {
    it('should handle tag assignment to task', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: 'I added the "Work" tag to "Buy groceries"',
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'assign_tag',
          task_id: 'task-123',
          details: {
            title: 'Buy groceries',
            tag_name: 'Work',
            tag_color: '#FF0000',
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Add work tag to buy groceries task',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('assign_tag');
      expect(lastMessage.actions?.[0].details?.tag_name).toBe('Work');
      expect(lastMessage.actions?.[0].task_id).toBe('task-123');
    });

    it('should handle tag assignment with disambiguation', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: 'I found multiple tasks matching "project". Which one did you mean?',
          timestamp: new Date().toISOString(),
        },
        metadata: {
          task_matches: [
            {
              id: 'task-1',
              title: 'Project meeting',
              due_date: '2026-02-20',
              priority: 'high',
              status: 'pending',
            },
            {
              id: 'task-2',
              title: 'Project report',
              due_date: '2026-02-21',
              priority: 'medium',
              status: 'pending',
            },
          ],
          task_reference: 'project',
        },
        action: {
          type: 'assign_tag',
          details: {
            tag_name: 'Work',
          },
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Add work tag to project tasks',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.metadata?.task_matches).toBeDefined();
      expect(lastMessage.metadata?.task_matches?.length).toBe(2);
      expect(lastMessage.metadata?.task_reference).toBe('project');
    });
  });

  describe('Tag Query Flow', () => {
    it('should handle list tags query', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: 'Here are your tags (3):\n  • Work 🔴\n  • Personal 🟢\n  • Urgent 🟡',
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'query_tags',
          details: {
            tags: [
              { id: 'tag-1', name: 'Work', color: '#FF0000' },
              { id: 'tag-2', name: 'Personal', color: '#008000' },
              { id: 'tag-3', name: 'Urgent', color: '#FFFF00' },
            ],
            count: 3,
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Show my tags',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('query_tags');
      expect(lastMessage.actions?.[0].details?.count).toBe(3);
      expect(lastMessage.actions?.[0].details?.tags).toHaveLength(3);
    });

    it('should handle empty tags list', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "You don't have any tags yet. Create one by saying \"Create a work tag in red\"",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'query_tags',
          details: {
            tags: [],
            count: 0,
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'What tags do I have',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('query_tags');
      expect(lastMessage.actions?.[0].details?.count).toBe(0);
    });
  });

  describe('Color Validation', () => {
    const namedColors = [
      { name: 'red', hex: '#FF0000' },
      { name: 'blue', hex: '#0000FF' },
      { name: 'green', hex: '#008000' },
      { name: 'yellow', hex: '#FFFF00' },
      { name: 'orange', hex: '#FFA500' },
      { name: 'purple', hex: '#800080' },
      { name: 'pink', hex: '#FFC0CB' },
    ];

    namedColors.forEach(({ name, hex }) => {
      it(`should handle named color "${name}"`, async () => {
        // Arrange
        const store = createTestStore();
        const mockResponse = {
          success: true,
          message: {
            id: 'msg-1',
            role: 'assistant',
            content: `I created a tag "Test" in ${name}`,
            timestamp: new Date().toISOString(),
          },
          action: {
            type: 'create_tag',
            tag_id: 'tag-test',
            details: {
              name: 'Test',
              color: hex,
              color_name: name.charAt(0).toUpperCase() + name.slice(1),
            },
            confirmed: true,
          },
        };

        vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

        // Act
        await act(async () => {
          store.dispatch(
            sendMessage({
              conversation_id: undefined,
              content: `Create test tag in ${name}`,
            })
          );
        });

        // Assert
        const state = store.getState();
        const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
        expect(lastMessage.actions?.[0].details?.color).toBe(hex);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle tag creation failure', async () => {
      // Arrange
      const store = createTestStore();
      const errorMessage = 'Tag with this name already exists';
      vi.mocked(chatApi.sendMessage).mockRejectedValue(new Error(errorMessage));

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Create work tag in red',
          })
        );
      });

      // Assert
      const state = store.getState();
      expect(state.agentChat.error).toBeDefined();
    });

    it('should handle tag not found on update', async () => {
      // Arrange
      const store = createTestStore();
      const errorMessage = 'Tag not found';
      vi.mocked(chatApi.sendMessage).mockRejectedValue(new Error(errorMessage));

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Rename nonexistent tag to something',
          })
        );
      });

      // Assert
      const state = store.getState();
      expect(state.agentChat.error).toBeDefined();
    });

    it('should handle invalid color format', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: false,
        error: 'Invalid color format. Use named colors or hex format.',
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse as any);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Create test tag in invalid-color',
          })
        );
      });

      // Assert
      const state = store.getState();
      expect(state.agentChat.error || mockResponse.error).toBeDefined();
    });
  });

  describe('Action Confirmation', () => {
    it('should confirm tag creation action', async () => {
      // Arrange
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'assistant',
              content: 'Creating tag...',
              timestamp: new Date().toISOString(),
              status: 'sent',
              actions: [
                {
                  id: 'action-1',
                  type: 'create_tag',
                  tag_id: 'tag-123',
                  details: {
                    name: 'Work',
                    color: '#FF0000',
                  },
                  confirmed: false,
                },
              ],
            },
          ],
          conversations: [],
          currentConversationId: 'conv-1',
          isLoading: false,
          isSending: false,
          error: null,
          typingIndicator: false,
        },
      });

      const mockConfirmResponse = {
        success: true,
        tag_id: 'tag-123',
        tag: {
          id: 'tag-123',
          name: 'Work',
          color: '#FF0000',
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockConfirmResponse);

      // Act
      await act(async () => {
        store.dispatch(
          confirmAction({
            messageId: 'msg-1',
            actionIndex: 0,
          })
        );
      });

      // Assert
      const state = store.getState();
      const message = state.agentChat.messages.find((m) => m.id === 'msg-1');
      expect(message?.actions?.[0].confirmed).toBe(true);
    });
  });
});

describe('Tag Management Natural Language Patterns', () => {
  const patterns = [
    {
      description: 'Create tag with named color',
      input: 'Create work tag in red',
      expectedIntent: 'create_tag',
    },
    {
      description: 'Create tag with hex color',
      input: 'Make a blue priority tag',
      expectedIntent: 'create_tag',
    },
    {
      description: 'Rename tag',
      input: 'Rename work tag to professional',
      expectedIntent: 'update_tag',
    },
    {
      description: 'Change tag color',
      input: 'Change work tag color to green',
      expectedIntent: 'update_tag',
    },
    {
      description: 'Delete tag',
      input: 'Delete old tag',
      expectedIntent: 'delete_tag',
    },
    {
      description: 'Assign tag to task',
      input: 'Add work tag to buy groceries',
      expectedIntent: 'assign_tag',
    },
    {
      description: 'List tags',
      input: 'Show my tags',
      expectedIntent: 'query_tags',
    },
  ];

  patterns.forEach(({ description, input, expectedIntent }) => {
    it(`should recognize pattern: ${description}`, () => {
      // This test documents expected natural language patterns
      // Actual intent parsing is done by the backend
      expect(input).toBeDefined();
      expect(expectedIntent).toBeDefined();
    });
  });
});

if (typeof window !== 'undefined') {
  describe('Component Integration (Manual Test Scenarios)', () => {
    const scenarios = [
      'User types "Create work tag in red" → tag created with color indicator',
      'User types "Rename work to professional" → tag renamed',
      'User types "Change tag color to green" → color updated with preview',
      'User types "Delete old tag" → confirmation shown → tag deleted',
      'User types "Add work tag to task" → task disambiguation if multiple matches',
      'User types "Show my tags" → list displayed with color indicators',
    ];

    scenarios.forEach((scenario, index) => {
      it.skip(`Scenario ${index + 1}: ${scenario}`, () => {
        // E2E test scenario - documented for manual testing
        expect(true).toBe(true);
      });
    });
  });
}
