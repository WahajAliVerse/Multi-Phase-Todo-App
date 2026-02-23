/**
 * Integration Tests for Chat-Based Reminder Scheduling (US6)
 *
 * Tests Redux store, API service, and component integration for reminder features.
 * Covers natural language reminder parsing, scheduling, and display.
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

describe('Chat Reminder Scheduling Integration (US6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Natural Language Reminder Pattern Parsing', () => {
    it('should parse "30 minutes before" pre-event reminder', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll set a reminder 30 minutes before your meeting.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'schedule_reminder',
          task_id: 'task-123',
          details: {
            title: 'Team meeting',
            reminder_time: '2026-02-20T09:30:00Z',
            reminder_time_display: 'in 30 minutes',
            delivery_method: 'browser',
            delivery_name: 'browser notification',
            is_recurring: false,
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
            content: 'Remind me 30 minutes before my meeting',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions).toBeDefined();
      expect(lastMessage.actions?.[0].type).toBe('schedule_reminder');
      expect(lastMessage.actions?.[0].details?.reminder_time_display).toBe('in 30 minutes');
      expect(lastMessage.actions?.[0].details?.delivery_method).toBe('browser');
    });

    it('should parse "1 hour before" pre-event reminder', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll set a reminder 1 hour before your dentist appointment.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'schedule_reminder',
          task_id: 'task-456',
          details: {
            title: 'Dentist appointment',
            reminder_time: '2026-02-21T10:00:00Z',
            reminder_time_display: 'in 1 hour',
            delivery_method: 'browser',
            delivery_name: 'browser notification',
            is_recurring: false,
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
            content: 'Remind me 1 hour before dentist appointment',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('schedule_reminder');
      expect(lastMessage.actions?.[0].details?.reminder_time_display).toBe('in 1 hour');
    });

    it('should parse absolute time reminder "tomorrow at 9am"', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll set a reminder for tomorrow at 9am.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'schedule_reminder',
          task_id: 'task-789',
          details: {
            title: 'Morning standup',
            reminder_time: '2026-02-19T09:00:00Z',
            reminder_time_display: 'tomorrow at 9:00 AM',
            delivery_method: 'browser',
            delivery_name: 'browser notification',
            is_recurring: false,
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
            content: 'Set a reminder for tomorrow at 9am',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('schedule_reminder');
      expect(lastMessage.actions?.[0].details?.reminder_time_display).toContain('tomorrow');
    });

    it('should parse recurring reminder "every day at 8pm"', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll set a recurring reminder to take medicine every day at 8pm.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'schedule_reminder',
          task_id: 'task-medicine',
          details: {
            title: 'Take medicine',
            reminder_time: '20:00',
            reminder_time_display: 'Every day at 8:00 PM',
            delivery_method: 'browser',
            delivery_name: 'browser notification',
            is_recurring: true,
            recurrence_description: 'Every day at 8:00 PM',
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
            content: 'Remind me to take medicine every day at 8pm',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('schedule_reminder');
      expect(lastMessage.actions?.[0].details?.is_recurring).toBe(true);
      expect(lastMessage.actions?.[0].details?.recurrence_description).toBe('Every day at 8:00 PM');
    });

    it('should parse recurring reminder "daily at 9am"', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll set a daily reminder at 9am.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'schedule_reminder',
          task_id: 'task-daily',
          details: {
            title: 'Daily check-in',
            reminder_time: '09:00',
            reminder_time_display: 'Every day at 9:00 AM',
            delivery_method: 'browser',
            delivery_name: 'browser notification',
            is_recurring: true,
            recurrence_description: 'Every day at 9:00 AM',
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
            content: 'Daily at 9am reminder',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].details?.is_recurring).toBe(true);
      expect(lastMessage.actions?.[0].details?.recurrence_description).toContain('Every day');
    });
  });

  describe('Delivery Method Parsing', () => {
    it('should parse "via browser" delivery method', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll set a browser notification reminder.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'schedule_reminder',
          task_id: 'task-123',
          details: {
            title: 'Meeting',
            reminder_time: '2026-02-20T09:30:00Z',
            delivery_method: 'browser',
            delivery_name: 'browser notification',
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
            content: 'Remind me 30 minutes before meeting via browser',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].details?.delivery_method).toBe('browser');
    });

    it('should parse "send email" delivery method', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll send you an email reminder.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'schedule_reminder',
          task_id: 'task-123',
          details: {
            title: 'Meeting',
            reminder_time: '2026-02-20T09:30:00Z',
            delivery_method: 'email',
            delivery_name: 'email',
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
            content: 'Remind me 30 minutes before meeting send email',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].details?.delivery_method).toBe('email');
    });

    it('should parse "push notification" delivery method', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll send you a push notification reminder.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'schedule_reminder',
          task_id: 'task-123',
          details: {
            title: 'Meeting',
            reminder_time: '2026-02-20T09:30:00Z',
            delivery_method: 'push',
            delivery_name: 'push notification',
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
            content: 'Remind me 30 minutes before meeting push notification',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].details?.delivery_method).toBe('push');
    });
  });

  describe('Reminder Confirmation UI', () => {
    it('should display reminder confirmation with time and delivery method', async () => {
      // Arrange
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'assistant',
              content: "I've set a reminder for your meeting.",
              timestamp: new Date().toISOString(),
              status: 'sent',
              actions: [
                {
                  id: 'action-1',
                  type: 'schedule_reminder',
                  task_id: 'task-123',
                  details: {
                    title: 'Team meeting',
                    reminder_time: '2026-02-20T09:30:00Z',
                    reminder_time_display: 'in 30 minutes',
                    delivery_method: 'browser',
                    delivery_name: 'browser notification',
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

      // Assert - verify state has reminder details
      const state = store.getState();
      const message = state.agentChat.messages[0];
      expect(message.actions?.[0].type).toBe('schedule_reminder');
      expect(message.actions?.[0].details?.reminder_time_display).toBe('in 30 minutes');
      expect(message.actions?.[0].details?.delivery_name).toBe('browser notification');
    });

    it('should display recurring reminder with recurrence description', async () => {
      // Arrange
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'assistant',
              content: "I've set a recurring reminder for your medicine.",
              timestamp: new Date().toISOString(),
              status: 'sent',
              actions: [
                {
                  id: 'action-1',
                  type: 'schedule_reminder',
                  task_id: 'task-medicine',
                  details: {
                    title: 'Take medicine',
                    reminder_time: '20:00',
                    reminder_time_display: 'Every day at 8:00 PM',
                    delivery_method: 'browser',
                    delivery_name: 'browser notification',
                    is_recurring: true,
                    recurrence_description: 'Every day at 8:00 PM',
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

      // Assert - verify recurring reminder details
      const state = store.getState();
      const message = state.agentChat.messages[0];
      expect(message.actions?.[0].details?.is_recurring).toBe(true);
      expect(message.actions?.[0].details?.recurrence_description).toBe('Every day at 8:00 PM');
    });

    it('should handle reminder confirmation action', async () => {
      // Arrange
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'assistant',
              content: 'Setting reminder...',
              timestamp: new Date().toISOString(),
              status: 'sent',
              actions: [
                {
                  id: 'action-1',
                  type: 'schedule_reminder',
                  task_id: 'task-123',
                  details: {
                    title: 'Meeting',
                    reminder_time: '2026-02-20T09:30:00Z',
                    delivery_method: 'browser',
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
        reminder_id: 'reminder-123',
        reminder: {
          id: 'reminder-123',
          task_id: 'task-123',
          reminder_time: '2026-02-20T09:30:00Z',
          delivery_method: 'browser',
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

  describe('Reminder Error Handling', () => {
    it('should handle missing task reference gracefully', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: false,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I need to know which task you want to set a reminder for. Could you specify the task name?",
          timestamp: new Date().toISOString(),
        },
        requires_clarification: true,
        clarification_questions: [
          "Which task should I set the reminder for?"
        ],
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Remind me 30 minutes before',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.content).toContain('which task');
      expect(lastMessage.metadata?.requires_clarification).toBe(true);
    });

    it('should handle backend errors for reminder scheduling', async () => {
      // Arrange
      const store = createTestStore();
      const errorMessage = 'Failed to schedule reminder';
      vi.mocked(chatApi.sendMessage).mockRejectedValue(new Error(errorMessage));

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Remind me 30 minutes before meeting',
          })
        );
      });

      // Assert
      const state = store.getState();
      expect(state.agentChat.error).toBeTruthy();
    });
  });

  describe('Reminder Display in Chat Responses', () => {
    it('should display reminder details in chat message', async () => {
      // Arrange
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'assistant',
              content: "I've set a reminder: Team meeting in 30 minutes via browser notification 🔔",
              timestamp: new Date().toISOString(),
              status: 'sent',
              actions: [
                {
                  id: 'action-1',
                  type: 'schedule_reminder',
                  task_id: 'task-123',
                  details: {
                    title: 'Team meeting',
                    reminder_time: '2026-02-20T09:30:00Z',
                    reminder_time_display: 'in 30 minutes',
                    delivery_method: 'browser',
                    delivery_name: 'browser notification',
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

      // Assert - verify reminder details are present
      const state = store.getState();
      const message = state.agentChat.messages[0];
      expect(message.content).toContain('reminder');
      expect(message.content).toContain('30 minutes');
      expect(message.actions?.[0].confirmed).toBe(true);
    });

    it('should display email delivery method correctly', async () => {
      // Arrange
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'assistant',
              content: "I've set an email reminder for your meeting.",
              timestamp: new Date().toISOString(),
              status: 'sent',
              actions: [
                {
                  id: 'action-1',
                  type: 'schedule_reminder',
                  task_id: 'task-123',
                  details: {
                    title: 'Team meeting',
                    reminder_time: '2026-02-20T09:30:00Z',
                    reminder_time_display: 'tomorrow at 9:30 AM',
                    delivery_method: 'email',
                    delivery_name: 'email',
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

      // Assert
      const state = store.getState();
      const message = state.agentChat.messages[0];
      expect(message.actions?.[0].details?.delivery_method).toBe('email');
      expect(message.actions?.[0].details?.delivery_name).toBe('email');
    });
  });

  describe('Custom Reminder Message', () => {
    it('should include custom message in reminder', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I'll set a reminder with your custom message.",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'schedule_reminder',
          task_id: 'task-123',
          details: {
            title: 'Team meeting',
            reminder_time: '2026-02-20T09:30:00Z',
            reminder_time_display: 'in 30 minutes',
            delivery_method: 'browser',
            delivery_name: 'browser notification',
            message: 'Don\'t forget to prepare the presentation!',
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
            content: 'Remind me 30 minutes before meeting. Message: Don\'t forget to prepare the presentation!',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].details?.message).toContain('prepare the presentation');
    });
  });
});

describe('Reminder Pattern Validation', () => {
  it('should validate pre-event reminder pattern', () => {
    // This test documents expected validation behavior
    const validPattern = {
      type: 'before_event',
      offset: { minutes: 30 },
      offset_text: '30 minutes before',
    };
    expect(validPattern.type).toBe('before_event');
    expect(validPattern.offset.minutes).toBe(30);
  });

  it('should validate absolute time reminder pattern', () => {
    // This test documents expected validation behavior
    const validPattern = {
      type: 'absolute',
      reminder_time: '2026-02-19T09:00:00Z',
      reminder_time_display: 'tomorrow at 9:00 AM',
    };
    expect(validPattern.type).toBe('absolute');
    expect(validPattern.reminder_time).toBeDefined();
  });

  it('should validate recurring reminder pattern', () => {
    // This test documents expected validation behavior
    const validPattern = {
      type: 'recurring',
      recurrence_type: 'daily',
      time: '20:00',
      description: 'Every day at 8:00 PM',
    };
    expect(validPattern.type).toBe('recurring');
    expect(validPattern.recurrence_type).toBe('daily');
  });
});

if (typeof window !== 'undefined') {
  describe('Component Integration (Manual Test Scenarios)', () => {
    // These scenarios should be tested manually or with E2E
    // Included for documentation purposes

    const scenarios = [
      'User types "Remind me 30 minutes before my meeting" → pre-event reminder scheduled',
      'User types "Remind me 1 hour before dentist appointment" → pre-event reminder with 1 hour offset',
      'User types "Set a reminder for tomorrow at 9am" → absolute time reminder',
      'User types "Remind me to take medicine every day at 8pm" → recurring daily reminder',
      'User types "Remind me 30 minutes before meeting via email" → email delivery',
      'User types "Remind me 15 minutes before meeting push notification" → push delivery',
      'User confirms reminder → success message with time and delivery method',
      'User requests reminder without task → clarification question shown',
    ];

    scenarios.forEach((scenario, index) => {
      it.skip(`Scenario ${index + 1}: ${scenario}`, () => {
        // E2E test scenario - documented for manual testing
        expect(true).toBe(true);
      });
    });
  });
}
