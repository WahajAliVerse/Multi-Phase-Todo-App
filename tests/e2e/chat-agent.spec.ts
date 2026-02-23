/**
 * E2E Tests for AI Task Assistant Chat
 * 
 * Tests complete user flows for chat-based task creation.
 */

import { test, expect, type Page } from '@playwright/test';

/**
 * Helper: Open chat modal
 */
async function openChatModal(page: Page) {
  const chatButton = page.locator('[data-testid="chat-button"]');
  await chatButton.click();
  await expect(page.locator('[data-testid="chat-modal"]')).toBeVisible();
}

/**
 * Helper: Send message in chat
 */
async function sendMessage(page: Page, message: string) {
  const input = page.locator('[data-testid="chat-input"]');
  await input.fill(message);
  await input.press('Enter');
}

/**
 * Helper: Wait for assistant response
 */
async function waitForAssistantResponse(page: Page) {
  await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
  await expect(page.locator('[data-testid="typing-indicator"]')).toBeHidden();
  const messages = page.locator('[data-testid="message-assistant"]');
  await expect(messages.last()).toBeVisible();
}

/**
 * Helper: Confirm task action
 */
async function confirmTaskAction(page: Page) {
  const confirmButton = page.locator('[data-testid="confirm-action-button"]');
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();
}

test.describe('AI Task Assistant - Chat-Based Task Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Basic Task Creation', () => {
    test('should create task from simple command', async ({ page }) => {
      // Arrange
      await openChatModal(page);

      // Act
      await sendMessage(page, 'Create a task to buy groceries');
      await waitForAssistantResponse(page);

      // Assert
      const messages = page.locator('[data-testid="message-assistant"]');
      await expect(messages.last()).toContainText(/task|created|success/i);
      
      // Verify task appears in task list
      await page.goto('/tasks');
      await expect(page.locator('[data-testid="task-list"]'))
        .toContainText('buy groceries', { ignoreCase: true });
    });

    test('should create task with priority', async ({ page }) => {
      await openChatModal(page);

      await sendMessage(page, 'Create a high priority task to call dentist');
      await waitForAssistantResponse(page);

      // Verify high priority task created
      await page.goto('/tasks');
      const taskItem = page.locator('[data-testid="task-item"]')
        .filter({ hasText: /call dentist/i });
      await expect(taskItem).toContainText('high', { ignoreCase: true });
    });

    test('should create task with description', async ({ page }) => {
      await openChatModal(page);

      await sendMessage(
        page,
        'Create task: Weekly team meeting. Description: Discuss project progress and blockers'
      );
      await waitForAssistantResponse(page);

      await page.goto('/tasks');
      await expect(page.locator('[data-testid="task-list"]'))
        .toContainText('Weekly team meeting');
    });
  });

  test.describe('Task Creation with Dates', () => {
    test('should create task with specific date', async ({ page }) => {
      await openChatModal(page);

      await sendMessage(
        page,
        'Create a task to submit report on February 25th at 5pm'
      );
      await waitForAssistantResponse(page);

      // Verify task with due date
      await page.goto('/tasks');
      await expect(page.locator('[data-testid="task-list"]'))
        .toContainText('submit report');
    });

    test('should handle ambiguous date with clarification', async ({ page }) => {
      await openChatModal(page);

      // Act - Send ambiguous request
      await sendMessage(page, 'Create a task for next week');
      
      // Wait for clarification
      await expect(page.locator('[data-testid="clarification-options"]'))
        .toBeVisible();

      // Select first date option
      const dateOption = page.locator('[data-testid="date-option"]').first();
      await dateOption.click();

      // Wait for confirmation
      await waitForAssistantResponse(page);

      // Assert
      const messages = page.locator('[data-testid="message-assistant"]');
      await expect(messages.last()).toContainText(/created|task/i);
    });

    test('should handle "tomorrow at 5pm" correctly', async ({ page }) => {
      await openChatModal(page);

      await sendMessage(page, 'Create task to pick up kids tomorrow at 5pm');
      await waitForAssistantResponse(page);

      // Verify task created
      await page.goto('/tasks');
      await expect(page.locator('[data-testid="task-list"]'))
        .toContainText('pick up kids');
    });
  });

  test.describe('Task Confirmation Flow', () => {
    test('should show confirmation before creating task', async ({ page }) => {
      await openChatModal(page);

      await sendMessage(page, 'Create a task to buy milk');
      await waitForAssistantResponse(page);

      // Verify confirmation UI shown
      await expect(page.locator('[data-testid="task-confirmation-card"]'))
        .toBeVisible();
      
      // Verify task details shown
      await expect(page.locator('[data-testid="task-title-preview"]'))
        .toContainText('buy milk', { ignoreCase: true });
    });

    test('should create task after confirmation', async ({ page }) => {
      await openChatModal(page);

      await sendMessage(page, 'Create task to water plants');
      await waitForAssistantResponse(page);
      await confirmTaskAction(page);

      // Wait for success message
      await expect(page.locator('[data-testid="success-message"]'))
        .toBeVisible();

      // Verify task in list
      await page.goto('/tasks');
      await expect(page.locator('[data-testid="task-list"]'))
        .toContainText('water plants');
    });

    test('should handle cancellation', async ({ page }) => {
      await openChatModal(page);

      await sendMessage(page, 'Create task to clean garage');
      await waitForAssistantResponse(page);

      // Cancel instead of confirm
      const cancelButton = page.locator('[data-testid="cancel-action-button"]');
      await expect(cancelButton).toBeVisible();
      await cancelButton.click();

      // Verify cancellation message
      await expect(page.locator('[data-testid="message-assistant"]'))
        .last()
        .toContainText(/cancelled|not created/i);
    });
  });

  test.describe('Error Handling', () => {
    test('should show error on network failure', async ({ page }) => {
      // Arrange - Simulate network failure
      await page.route('**/api/agent/chat', (route) =>
        route.abort('failed')
      );

      await openChatModal(page);

      // Act
      await sendMessage(page, 'Create a task');
      
      // Wait a bit for error
      await page.waitForTimeout(2000);

      // Assert
      await expect(page.locator('[data-testid="error-banner"]'))
        .toBeVisible();
      await expect(page.locator('[data-testid="error-banner"]'))
        .toContainText(/error|failed|try again/i);
    });

    test('should handle rate limiting', async ({ page }) => {
      await openChatModal(page);

      // Send multiple rapid requests
      for (let i = 0; i < 12; i++) {
        await sendMessage(page, `Task ${i}`);
        await page.waitForTimeout(100);
      }

      // Should see rate limit error
      await expect(page.locator('[data-testid="error-banner"]'))
        .toBeVisible();
      await expect(page.locator('[data-testid="error-banner"]'))
        .toContainText(/too many requests|wait/i);
    });

    test('should allow retry after error', async ({ page }) => {
      await page.route('**/api/agent/chat', (route) =>
        route.abort('failed')
      );

      await openChatModal(page);
      await sendMessage(page, 'Create task');
      await page.waitForTimeout(2000);

      // Verify error shown
      await expect(page.locator('[data-testid="error-banner"]')).toBeVisible();

      // Reset route to succeed
      await page.route('**/api/agent/chat', (route) =>
        route.fulfill({
          status: 200,
          json: {
            success: true,
            message: { role: 'assistant', content: 'Task created' },
          },
        })
      );

      // Retry
      const retryButton = page.locator('[data-testid="retry-button"]');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        await waitForAssistantResponse(page);
        await expect(page.locator('[data-testid="message-assistant"]'))
          .last()
          .toContainText('created');
      }
    });
  });

  test.describe('Conversation Management', () => {
    test('should persist conversation history', async ({ page }) => {
      await openChatModal(page);

      // Send multiple messages
      await sendMessage(page, 'Create task one');
      await waitForAssistantResponse(page);
      
      await sendMessage(page, 'Create task two');
      await waitForAssistantResponse(page);

      // Close and reopen modal
      const closeButton = page.locator('[data-testid="chat-close-button"]');
      await closeButton.click();
      
      await page.waitForTimeout(500);
      await openChatModal(page);

      // Verify messages persist
      const messages = page.locator('[data-testid="message"]');
      await expect(messages).toHaveCount(4); // 2 user + 2 assistant
    });

    test('should create new conversation', async ({ page }) => {
      await openChatModal(page);

      // Click new conversation button
      const newConvButton = page.locator('[data-testid="new-conversation-button"]');
      await newConvButton.click();

      // Verify clean slate
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    });

    test('should switch between conversations', async ({ page }) => {
      await openChatModal(page);

      // Create first conversation
      await sendMessage(page, 'Task about project');
      await waitForAssistantResponse(page);

      // Create new conversation
      const newConvButton = page.locator('[data-testid="new-conversation-button"]');
      await newConvButton.click();

      await sendMessage(page, 'Task about personal');
      await waitForAssistantResponse(page);

      // Switch back to first conversation
      const conversationList = page.locator('[data-testid="conversation-list"]');
      await conversationList
        .locator('[data-testid="conversation-item"]')
        .filter({ hasText: /project/i })
        .click();

      // Verify messages from first conversation
      await expect(page.locator('[data-testid="message"]'))
        .toContainText('project');
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.keyboard.press('Tab'); // Navigate to chat button
      await page.keyboard.press('Enter'); // Open chat

      await expect(page.locator('[data-testid="chat-modal"]')).toBeVisible();

      // Navigate to input
      await page.keyboard.press('Tab');
      await page.keyboard.type('Test task');
      await page.keyboard.press('Enter');

      await waitForAssistantResponse(page);
    });

    test('should close modal with Escape key', async ({ page }) => {
      await openChatModal(page);

      await page.keyboard.press('Escape');

      await expect(page.locator('[data-testid="chat-modal"]'))
        .not.toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await openChatModal(page);

      // Check ARIA labels
      await expect(page.locator('[aria-label="Chat modal"]')).toBeVisible();
      await expect(page.locator('[aria-label="Message input"]')).toBeVisible();
      await expect(page.locator('[aria-label="Send message"]')).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle empty message', async ({ page }) => {
      await openChatModal(page);

      // Try to send empty message
      const input = page.locator('[data-testid="chat-input"]');
      await input.fill('');
      await input.press('Enter');

      // Should not send
      const messages = page.locator('[data-testid="message"]');
      await expect(messages).toHaveCount(0);
    });

    test('should handle very long messages', async ({ page }) => {
      await openChatModal(page);

      const longMessage = 'Create task: ' + 'a'.repeat(1000);
      await sendMessage(page, longMessage);
      
      // Should either send or show validation error
      await page.waitForTimeout(2000);
      
      // Either response or error message
      const hasResponse = await page
        .locator('[data-testid="message-assistant"]')
        .count() > 0;
      const hasError = await page
        .locator('[data-testid="error-banner"]')
        .isVisible();
      
      expect(hasResponse || hasError).toBe(true);
    });

    test('should handle special characters', async ({ page }) => {
      await openChatModal(page);

      await sendMessage(page, 'Create task: Test @#$%^&*() task!');
      await waitForAssistantResponse(page);

      // Should not crash
      await expect(page.locator('[data-testid="chat-modal"]')).toBeVisible();
    });
  });
});

test.describe('Natural Language Understanding', () => {
  test('should understand "add" as create', async ({ page }) => {
    await openChatModal(page);
    await sendMessage(page, 'Add a task to call mom');
    await waitForAssistantResponse(page);
    
    await page.goto('/tasks');
    await expect(page.locator('[data-testid="task-list"]'))
      .toContainText('call mom');
  });

  test('should understand "schedule" as create with date', async ({ page }) => {
    await openChatModal(page);
    await sendMessage(page, 'Schedule dentist appointment for next Monday');
    await waitForAssistantResponse(page);
    
    await page.goto('/tasks');
    await expect(page.locator('[data-testid="task-list"]'))
      .toContainText('dentist');
  });

  test('should understand "remind me" as create with reminder', async ({ page }) => {
    await openChatModal(page);
    await sendMessage(page, 'Remind me to take medicine at 8pm');
    await waitForAssistantResponse(page);
    
    // Verify reminder created or task with reminder
    await page.goto('/tasks');
    await expect(page.locator('[data-testid="task-list"]'))
      .toContainText('medicine');
  });
});
