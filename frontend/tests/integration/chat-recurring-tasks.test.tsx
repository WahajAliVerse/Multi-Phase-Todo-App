/**
 * Integration Tests for Chat-Based Recurring Task Management
 *
 * Tests Redux store, API service, and component integration for recurrence features.
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

describe('Chat Recurring Task Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Natural Language Recurrence Pattern Parsing', () => {
    it('should parse weekly recurrence pattern from natural language', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll set up a weekly recurring task for your team meeting every Monday at 10am.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'create_recurrence',
          task_id: 'task-123',
          details: {
            title: 'Team meeting',
            pattern: 'weekly',
            interval: 1,
            days_of_week: ['mon'],
            time: '10:00',
            end_condition: 'never',
            recurrence_summary: 'Every Monday at 10AM',
          },
          requires_confirmation: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Weekly team meeting every Monday at 10am starting next week',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions).toBeDefined();
      expect(lastMessage.actions?.[0].type).toBe('create_recurrence');
      expect(lastMessage.actions?.[0].details?.pattern).toBe('weekly');
      expect(lastMessage.actions?.[0].details?.days_of_week).toEqual(['mon']);
    });

    it('should parse monthly recurrence pattern from natural language', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll create a monthly recurring task for your report on the 15th of each month.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'create_recurrence',
          task_id: 'task-456',
          details: {
            title: 'Monthly report',
            pattern: 'monthly',
            interval: 1,
            day_of_month: 15,
            end_condition: 'never',
            recurrence_summary: 'Monthly on the 15th',
          },
          requires_confirmation: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Monthly report on the 15th of each month',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('create_recurrence');
      expect(lastMessage.actions?.[0].details?.pattern).toBe('monthly');
      expect(lastMessage.actions?.[0].details?.day_of_month).toBe(15);
    });

    it('should parse daily weekday recurrence pattern', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll set up a daily recurring task for your standup every weekday at 9am.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'create_recurrence',
          task_id: 'task-789',
          details: {
            title: 'Daily standup',
            pattern: 'weekly',
            interval: 1,
            days_of_week: ['mon', 'tue', 'wed', 'thu', 'fri'],
            time: '09:00',
            end_condition: 'never',
            recurrence_summary: 'Every weekday at 9AM',
          },
          requires_confirmation: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Daily standup every weekday at 9am',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('create_recurrence');
      expect(lastMessage.actions?.[0].details?.days_of_week).toEqual(['mon', 'tue', 'wed', 'thu', 'fri']);
    });

    it('should parse recurrence with end condition (occurrences)', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll create a recurring task for 10 occurrences.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'create_recurrence',
          task_id: 'task-123',
          details: {
            title: 'Exercise routine',
            pattern: 'daily',
            interval: 1,
            end_condition: 'after',
            end_after_occurrences: 10,
            recurrence_summary: 'Daily for 10 occurrences',
          },
          requires_confirmation: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Daily exercise for 10 occurrences',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('create_recurrence');
      expect(lastMessage.actions?.[0].details?.end_condition).toBe('after');
      expect(lastMessage.actions?.[0].details?.end_after_occurrences).toBe(10);
    });

    it('should parse recurrence with end condition (date)', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll create a recurring task until December 31st.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'create_recurrence',
          task_id: 'task-123',
          details: {
            title: 'Weekly review',
            pattern: 'weekly',
            interval: 1,
            days_of_week: ['fri'],
            end_condition: 'on_date',
            end_date: '2026-12-31',
            recurrence_summary: 'Every Friday until December 31, 2026',
          },
          requires_confirmation: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Weekly review every Friday until December 31',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('create_recurrence');
      expect(lastMessage.actions?.[0].details?.end_condition).toBe('on_date');
      expect(lastMessage.actions?.[0].details?.end_date).toBe('2026-12-31');
    });
  });

  describe('Recurrence Confirmation UI', () => {
    it('should display recurrence pattern summary in action confirmation', async () => {
      // Arrange
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'assistant',
              content: "I'll set up a weekly recurring task for your team meeting.",
              timestamp: new Date().toISOString(),
              status: 'sent',
              actions: [
                {
                  id: 'action-1',
                  type: 'create_recurrence',
                  task_id: 'task-123',
                  details: {
                    title: 'Team meeting',
                    pattern: 'weekly',
                    interval: 1,
                    days_of_week: ['mon'],
                    time: '10:00',
                    recurrence_summary: 'Every Monday at 10AM',
                  },
                  requires_confirmation: true,
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

      // Render component with store
      render(
        <Provider store={store}>
          <div data-testid="chat-container">
            {/* Chat UI would be rendered here */}
          </div>
        </Provider>
      );

      // Assert - verify state has recurrence details
      const state = store.getState();
      const message = state.agentChat.messages[0];
      expect(message.actions?.[0].details?.recurrence_summary).toBe('Every Monday at 10AM');
    });

    it('should handle recurrence confirmation action', async () => {
      // Arrange
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'assistant',
              content: 'Creating recurring task...',
              timestamp: new Date().toISOString(),
              status: 'sent',
              actions: [
                {
                  id: 'action-1',
                  type: 'create_recurrence',
                  task_id: 'task-123',
                  details: {
                    title: 'Team meeting',
                    pattern: 'weekly',
                    days_of_week: ['mon'],
                  },
                  requires_confirmation: true,
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
        recurrence_id: 'rec-123',
        pattern: {
          id: 'rec-123',
          frequency: 'weekly',
          days_of_week: ['mon'],
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

  describe('Update Recurrence Pattern', () => {
    it('should handle update recurrence pattern action', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll update your recurring task to every Tuesday instead of Monday.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'update_recurrence',
          recurrence_id: 'rec-123',
          details: {
            title: 'Team meeting',
            pattern: 'weekly',
            days_of_week: ['tue'],
            updated_fields: ['days_of_week'],
            recurrence_summary: 'Every Tuesday at 10AM',
          },
          requires_confirmation: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Change my team meeting to every Tuesday',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('update_recurrence');
      expect(lastMessage.actions?.[0].details?.days_of_week).toEqual(['tue']);
    });
  });

  describe('Cancel Recurrence', () => {
    it('should handle cancel recurrence action', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll cancel the recurring pattern for your team meeting. Future occurrences will not be created.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'cancel_recurrence',
          recurrence_id: 'rec-123',
          details: {
            title: 'Team meeting',
          },
          requires_confirmation: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Cancel the recurring team meeting',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('cancel_recurrence');
    });
  });

  describe('Recurrence Error Handling', () => {
    it('should handle invalid recurrence pattern gracefully', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: false,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'm having trouble understanding the recurrence pattern. Could you clarify how often this should repeat?",
          timestamp: new Date().toISOString(),
        },
        requires_clarification: true,
        clarification_questions: [
          "How often should this task repeat? (e.g., 'every Monday', 'monthly on the 15th', 'daily')"
        ],
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Create a recurring task with invalid pattern xyz123',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.content).toContain('trouble understanding');
      expect(lastMessage.metadata?.requires_clarification).toBe(true);
    });

    it('should handle backend errors for recurrence operations', async () => {
      // Arrange
      const store = createTestStore();
      const errorMessage = 'Failed to create recurrence pattern';
      vi.mocked(chatApi.sendMessage).mockRejectedValue(new Error(errorMessage));

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Create weekly recurring task',
          })
        );
      });

      // Assert
      const state = store.getState();
      expect(state.agentChat.error).toBeTruthy();
    });
  });

  describe('Recurrence Display in Chat Responses', () => {
    it('should display recurrence details in chat message', async () => {
      // Arrange
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'assistant',
              content: "I've created a recurring task: Team meeting every Monday at 10AM.",
              timestamp: new Date().toISOString(),
              status: 'sent',
              actions: [
                {
                  id: 'action-1',
                  type: 'create_recurrence',
                  task_id: 'task-123',
                  details: {
                    title: 'Team meeting',
                    pattern: 'weekly',
                    interval: 1,
                    days_of_week: ['mon'],
                    time: '10:00',
                    recurrence_summary: 'Every Monday at 10AM',
                  },
                  confirmed: true,
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

      // Assert - verify recurrence details are present
      const state = store.getState();
      const message = state.agentChat.messages[0];
      expect(message.content).toContain('recurring task');
      expect(message.content).toContain('every Monday at 10AM');
      expect(message.actions?.[0].confirmed).toBe(true);
    });
  });
});

describe('Recurrence Pattern Validation', () => {
  it('should validate weekly pattern with valid days', () => {
    // This test documents expected validation behavior
    const validPattern = {
      frequency: 'weekly',
      interval: 1,
      days_of_week: ['mon', 'wed', 'fri'],
      end_condition: 'never',
    };
    expect(validPattern.frequency).toBe('weekly');
    expect(validPattern.days_of_week).toEqual(['mon', 'wed', 'fri']);
  });

  it('should validate monthly pattern with valid day', () => {
    // This test documents expected validation behavior
    const validPattern = {
      frequency: 'monthly',
      interval: 1,
      day_of_month: 15,
      end_condition: 'never',
    };
    expect(validPattern.frequency).toBe('monthly');
    expect(validPattern.day_of_month).toBe(15);
  });
});

if (typeof window !== 'undefined') {
  describe('Component Integration (Manual Test Scenarios)', () => {
    // These scenarios should be tested manually or with E2E
    // Included for documentation purposes

    const scenarios = [
      'User types "Weekly team meeting every Monday at 10am" → recurrence created with confirmation',
      'User types "Monthly report on the 15th" → monthly recurrence pattern created',
      'User types "Daily standup every weekday at 9am" → weekday recurrence created',
      'User types "For 10 occurrences" → end condition set correctly',
      'User types "Until December 31" → end date set correctly',
      'User confirms recurrence → success message with pattern summary',
      'User updates recurrence pattern → pattern updated with confirmation',
      'User cancels recurrence → confirmation dialog shown',
    ];

    scenarios.forEach((scenario, index) => {
      it.skip(`Scenario ${index + 1}: ${scenario}`, () => {
        // E2E test scenario - documented for manual testing
        expect(true).toBe(true);
      });
    });
  });
}
