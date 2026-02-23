/**
 * Integration Tests for Chat-Based Task Updates (US2)
 *
 * Tests natural language task update functionality including:
 * - Due date updates ("Move dentist appointment to Friday")
 * - Priority updates ("Change priority of buy groceries to high")
 * - Tag assignments ("Add work tag to project task")
 * - Task disambiguation for multiple matches
 * - Update confirmation UI
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { agentChatReducer, sendMessage, confirmAction, setTypingIndicator } from '@/redux/slices/agentChat';
import { chatApi } from '@/utils/api';
import type { ChatMessage, ChatAction, ChatConversation, Task } from '@/types';

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

describe('Chat Task Update Integration (US2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Due Date Update', () => {
    it('should handle "Move task to Friday" update', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I've moved \"Dentist Appointment\" to Friday, February 21, 2026",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'update_task',
          task_id: 'task-123',
          details: {
            title: 'Dentist Appointment',
            due_date: '2026-02-21T09:00:00Z',
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
            content: 'Move dentist appointment to Friday',
          })
        );
      });

      // Assert
      const state = store.getState();
      expect(state.agentChat.isSending).toBe(false);
      expect(state.agentChat.messages.length).toBeGreaterThan(0);
      
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.content).toContain('Dentist Appointment');
      expect(lastMessage.actions?.[0].type).toBe('update_task');
      expect(lastMessage.actions?.[0].details?.due_date).toBeDefined();
    });

    it('should handle date clarification for ambiguous dates', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'clarification',
          content: 'When exactly? Choose: 1) This Friday (Feb 20) or 2) Next Friday (Feb 27)',
          timestamp: new Date().toISOString(),
        },
        clarification: {
          questions: ['When exactly? Choose: 1) This Friday (Feb 20) or 2) Next Friday (Feb 27)'],
          date_options: [
            {
              index: 0,
              label: 'This Friday (Feb 20)',
              date: '2026-02-20',
            },
            {
              index: 1,
              label: 'Next Friday (Feb 27)',
              date: '2026-02-27',
            },
          ],
          intent_type: 'update_task',
          entities: {
            task_reference: 'dentist appointment',
          },
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Move dentist appointment to Friday',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.role).toBe('clarification');
      expect(lastMessage.content).toContain('When exactly?');
    });
  });

  describe('Priority Update', () => {
    it('should handle "Change priority to high" update', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I've changed the priority of \"Buy Groceries\" to high 🔴",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'update_task',
          task_id: 'task-456',
          details: {
            title: 'Buy Groceries',
            priority: 'high',
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
            content: 'Change priority of buy groceries to high',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.content).toContain('priority');
      expect(lastMessage.content).toContain('high');
      expect(lastMessage.actions?.[0].type).toBe('update_task');
      expect(lastMessage.actions?.[0].details?.priority).toBe('high');
    });

    it('should handle priority update with task disambiguation', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'clarification',
          content: 'I found multiple tasks matching "project":\n  1. "Project Alpha Review" (Due: Feb 20, Priority: medium)\n  2. "Project Beta Planning" (Due: Feb 25, Priority: low)\n\nWhich one did you mean?',
          timestamp: new Date().toISOString(),
        },
        clarification: {
          questions: ['Which task?'],
          task_matches: [
            {
              id: 'task-1',
              title: 'Project Alpha Review',
              due_date: '2026-02-20T09:00:00Z',
              priority: 'medium',
              status: 'pending',
            },
            {
              id: 'task-2',
              title: 'Project Beta Planning',
              due_date: '2026-02-25T09:00:00Z',
              priority: 'low',
              status: 'pending',
            },
          ],
          intent_type: 'update_task',
          entities: {
            task_reference: 'project',
            priority: 'high',
          },
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Change priority of project task to high',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.role).toBe('clarification');
      expect(lastMessage.metadata?.task_matches).toBeDefined();
      expect(lastMessage.metadata?.task_matches?.length).toBe(2);
    });
  });

  describe('Tag Assignment', () => {
    it('should handle "Add work tag to task" update', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I've added the \"work\" tag to \"Project Report\"",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'assign_tag',
          task_id: 'task-789',
          details: {
            title: 'Project Report',
            tag_name: 'work',
            tag_color: '#3B82F6',
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
            content: 'Add work tag to project report',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.content).toContain('work');
      expect(lastMessage.content).toContain('tag');
      expect(lastMessage.actions?.[0].type).toBe('assign_tag');
      expect(lastMessage.actions?.[0].details?.tag_name).toBe('work');
    });
  });

  describe('Task Disambiguation', () => {
    it('should present task matches when multiple tasks found', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'clarification',
          content: 'I found multiple tasks matching "meeting":\n  1. "Team Meeting" (Due: Feb 20, Priority: high)\n  2. "Client Meeting" (Due: Feb 22, Priority: medium)\n  3. "1:1 Meeting" (Due: Feb 21, Priority: low)\n\nWhich one did you mean? (reply with number)',
          timestamp: new Date().toISOString(),
        },
        clarification: {
          questions: ['Which task?'],
          task_matches: [
            {
              id: 'task-1',
              title: 'Team Meeting',
              due_date: '2026-02-20T10:00:00Z',
              priority: 'high',
              status: 'pending',
            },
            {
              id: 'task-2',
              title: 'Client Meeting',
              due_date: '2026-02-22T14:00:00Z',
              priority: 'medium',
              status: 'pending',
            },
            {
              id: 'task-3',
              title: '1:1 Meeting',
              due_date: '2026-02-21T15:00:00Z',
              priority: 'low',
              status: 'pending',
            },
          ],
          intent_type: 'update_task',
          entities: {
            task_reference: 'meeting',
            updates: { due_date: '2026-02-25T09:00:00Z' },
          },
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Move meeting to next Wednesday',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.metadata?.task_matches).toBeDefined();
      expect(lastMessage.metadata?.task_matches?.length).toBe(3);
      expect(lastMessage.metadata?.task_reference).toBe('meeting');
    });

    it('should handle task selection from disambiguation', async () => {
      // Arrange - Initial state with task matches
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'clarification',
              content: 'Which task?',
              timestamp: new Date().toISOString(),
              status: 'sent',
              metadata: {
                task_matches: [
                  {
                    id: 'task-1',
                    title: 'Team Meeting',
                    due_date: '2026-02-20T10:00:00Z',
                    priority: 'high',
                    status: 'pending',
                  },
                ],
                task_reference: 'meeting',
              },
              actions: [],
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

      const mockFollowUpResponse = {
        success: true,
        message: {
          id: 'msg-2',
          role: 'assistant',
          content: "I've moved \"Team Meeting\" to Wednesday, February 25, 2026",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'update_task',
          task_id: 'task-1',
          details: {
            title: 'Team Meeting',
            due_date: '2026-02-25T09:00:00Z',
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockFollowUpResponse);

      // Act - Send follow-up with task selection
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: 'conv-1',
            content: '1', // User selects first task
            clarification_response: {
              selected_task_index: 0,
              selected_task_id: 'task-1',
            },
          })
        );
      });

      // Assert
      const state = store.getState();
      expect(state.agentChat.messages.length).toBe(2);
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('update_task');
      expect(lastMessage.actions?.[0].task_id).toBe('task-1');
    });
  });

  describe('Update Confirmation UI', () => {
    it('should show confirmed update action with details', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "✓ Updated \"Buy Groceries\" - set due date to February 25, 2026, priority to high 🔴",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'update_task',
          task_id: 'task-123',
          details: {
            title: 'Buy Groceries',
            due_date: '2026-02-25T09:00:00Z',
            priority: 'high',
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
            content: 'Move buy groceries to next Wednesday and make it high priority',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].confirmed).toBe(true);
      expect(lastMessage.actions?.[0].details?.due_date).toBeDefined();
      expect(lastMessage.actions?.[0].details?.priority).toBe('high');
    });

    it('should handle multiple field updates in single command', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: true,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "✓ Updated \"Project Report\" - set due date to February 28, 2026, priority to high 🔴",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'update_task',
          task_id: 'task-456',
          details: {
            title: 'Project Report',
            due_date: '2026-02-28T09:00:00Z',
            priority: 'high',
          },
          confirmed: true,
          result: {
            id: 'task-456',
            title: 'Project Report',
            due_date: '2026-02-28T09:00:00Z',
            priority: 'high',
            status: 'pending',
          },
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Update project report to high priority and due Feb 28',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].details?.due_date).toBe('2026-02-28T09:00:00Z');
      expect(lastMessage.actions?.[0].details?.priority).toBe('high');
      expect(lastMessage.actions?.[0].result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle task not found error', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: false,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I couldn't find a task matching \"nonexistent task\". Please check the task name or try a different description.",
          timestamp: new Date().toISOString(),
        },
        error: {
          code: 'TASK_NOT_FOUND',
          message: "Task not found",
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Move nonexistent task to Friday',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.content).toContain("couldn't find");
    });

    it('should handle invalid update request', async () => {
      // Arrange
      const store = createTestStore();
      const mockResponse = {
        success: false,
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: "I need to know what you'd like to update. Please specify what change you want to make (e.g., new due date, priority, or title).",
          timestamp: new Date().toISOString(),
        },
        clarification: {
          questions: ["What would you like to change about the task?"],
          intent_type: 'update_task',
          entities: {
            task_reference: 'groceries',
          },
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Update groceries task',
          })
        );
      });

      // Assert
      const state = store.getState();
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.role).toBe('clarification');
      expect(lastMessage.content).toContain('what you\'d like to update');
    });
  });

  describe('Conversation Context', () => {
    it('should maintain context for follow-up updates', async () => {
      // Arrange
      const store = createTestStore({
        agentChat: {
          messages: [
            {
              id: 'msg-1',
              conversation_id: 'conv-1',
              role: 'user',
              content: 'Move dentist appointment to Friday',
              timestamp: new Date().toISOString(),
              status: 'sent',
            },
            {
              id: 'msg-2',
              conversation_id: 'conv-1',
              role: 'assistant',
              content: "I've moved \"Dentist Appointment\" to Friday, February 21, 2026",
              timestamp: new Date().toISOString(),
              status: 'sent',
              actions: [
                {
                  type: 'update_task',
                  task_id: 'task-123',
                  details: {
                    title: 'Dentist Appointment',
                    due_date: '2026-02-21T09:00:00Z',
                  },
                  confirmed: true,
                },
              ],
            },
          ],
          conversations: [{ id: 'conv-1', title: 'Task Updates', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_active: true }],
          currentConversationId: 'conv-1',
          isLoading: false,
          isSending: false,
          error: null,
          typingIndicator: false,
        },
      });

      const mockResponse = {
        success: true,
        message: {
          id: 'msg-3',
          role: 'assistant',
          content: "I've also changed the priority of \"Dentist Appointment\" to high 🔴",
          timestamp: new Date().toISOString(),
        },
        action: {
          type: 'update_task',
          task_id: 'task-123',
          details: {
            title: 'Dentist Appointment',
            priority: 'high',
          },
          confirmed: true,
        },
      };

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

      // Act - Follow-up update
      await act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: 'conv-1',
            content: 'Also make it high priority',
          })
        );
      });

      // Assert
      const state = store.getState();
      expect(state.agentChat.messages.length).toBe(3);
      const lastMessage = state.agentChat.messages[state.agentChat.messages.length - 1];
      expect(lastMessage.actions?.[0].type).toBe('update_task');
      expect(lastMessage.actions?.[0].details?.priority).toBe('high');
    });
  });

  describe('Typing Indicator', () => {
    it('should show typing indicator while processing update', async () => {
      // Arrange
      const store = createTestStore();
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(chatApi.sendMessage).mockImplementation(() => pendingPromise);

      // Act
      const sendPromise = act(async () => {
        store.dispatch(
          sendMessage({
            conversation_id: undefined,
            content: 'Move task to Friday',
          })
        );
      });

      // Assert - typing indicator should be active
      await waitFor(() => {
        const state = store.getState();
        expect(state.agentChat.typingIndicator).toBe(true);
      });

      // Cleanup
      resolvePromise!({ success: true, message: {} });
      await sendPromise;

      // Typing indicator should be off after response
      const state = store.getState();
      expect(state.agentChat.typingIndicator).toBe(false);
    });
  });
});

describe('Chat API Service Integration for Updates', () => {
  it('should handle update_task action type', () => {
    // Verify action type is properly defined
    const updateAction: ChatAction = {
      type: 'update_task',
      task_id: 'task-123',
      details: {
        title: 'Test Task',
        due_date: '2026-02-25T09:00:00Z',
        priority: 'high',
      },
      confirmed: true,
    };

    expect(updateAction.type).toBe('update_task');
    expect(updateAction.task_id).toBe('task-123');
    expect(updateAction.details?.priority).toBe('high');
  });

  it('should handle assign_tag action type', () => {
    // Verify action type is properly defined
    const assignAction: ChatAction = {
      type: 'assign_tag',
      task_id: 'task-123',
      details: {
        title: 'Test Task',
        tag_name: 'work',
        tag_color: '#3B82F6',
      },
      confirmed: true,
    };

    expect(assignAction.type).toBe('assign_tag');
    expect(assignAction.details?.tag_name).toBe('work');
  });
});

if (typeof window !== 'undefined') {
  describe('Component Integration (Manual Test Scenarios)', () => {
    // These scenarios should be tested manually or with E2E
    // Included for documentation purposes

    const scenarios = [
      'User types "Move dentist appointment to Friday" → task due date updated',
      'User types "Change priority of buy groceries to high" → priority updated',
      'User types "Add work tag to project task" → tag assigned',
      'Multiple matching tasks → disambiguation UI shown',
      'User selects task from disambiguation → update executed',
      'Ambiguous date → clarification questions shown',
      'Update confirmed → success message with details displayed',
      'Task not found → helpful error message shown',
    ];

    scenarios.forEach((scenario, index) => {
      it.skip(`Scenario ${index + 1}: ${scenario}`, () => {
        // E2E test scenario - documented for manual testing
        expect(true).toBe(true);
      });
    });
  });
}
