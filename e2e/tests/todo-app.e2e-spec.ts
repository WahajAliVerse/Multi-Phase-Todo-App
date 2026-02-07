// End-to-end tests for the Todo Application
// These tests verify the complete functionality of the application

import { test, expect } from '@playwright/test';

// Test user credentials
const testUser = {
  email: 'testuser@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User'
};

test.describe('Todo Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('User can register, create tasks, and manage them', async ({ page }) => {
    // 1. Register a new user
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);

    await page.locator('#first-name').fill(testUser.firstName);
    await page.locator('#last-name').fill(testUser.lastName);
    await page.locator('#email').fill(testUser.email);
    await page.locator('#password').fill(testUser.password);
    await page.locator('#confirm-password').fill(testUser.password);

    await page.getByRole('button', { name: 'Create Account' }).click();

    // 2. Verify registration and login
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(`Welcome, ${testUser.firstName}`)).toBeVisible();

    // 3. Create a new task
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.locator('#title').fill('Test Task 1');
    await page.locator('#description').fill('This is a test task');
    
    // Select priority
    await page.locator('.priority-selector').click();
    await page.getByRole('option', { name: 'High' }).click();
    
    // Set due date
    await page.locator('#due-date').fill('2024-12-31T10:00');
    
    // Add tag
    await page.getByText('#work').click(); // Assuming 'work' tag exists
    
    await page.getByRole('button', { name: 'Create Task' }).click();
    
    // 4. Verify task was created
    await expect(page.getByText('Test Task 1')).toBeVisible();
    await expect(page.getByText('High')).toBeVisible();
    
    // 5. Edit the task
    await page.getByRole('button', { name: 'Edit' }).first().click();
    
    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.locator('#title').fill('Updated Test Task 1');
    await page.getByRole('button', { name: 'Update Task' }).click();
    
    // 6. Verify task was updated
    await expect(page.getByText('Updated Test Task 1')).toBeVisible();
    
    // 7. Mark task as complete
    const checkbox = page.locator('.task-card').first().locator('data-testid=task-checkbox');
    await checkbox.click();
    
    // 8. Verify task is marked as complete
    await expect(page.locator('.task-card').first().locator('.line-through')).toBeVisible();
    
    // 9. Filter tasks by priority
    await page.locator('#priority-filter').click();
    await page.getByRole('option', { name: 'High' }).click();
    
    // 10. Verify only high priority tasks are shown
    const taskCards = page.locator('.task-card');
    await expect(taskCards).toHaveCount(1); // Only our test task should remain
    
    // 11. Search for the task
    await page.locator('#search-bar').fill('Updated Test');
    await expect(taskCards).toHaveCount(1);
    
    // 12. Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('User can manage recurring tasks', async ({ page }) => {
    // Login with existing user
    await page.getByRole('link', { name: 'Login' }).click();
    await page.locator('#email').fill(testUser.email);
    await page.locator('#password').fill(testUser.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Create a recurring task
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    await page.locator('#title').fill('Recurring Task');
    await page.locator('#description').fill('This task repeats weekly');
    
    // Enable recurrence
    await page.getByRole('button', { name: 'Enable Recurrence' }).click();
    
    // Set recurrence pattern
    await page.locator('#recurrence-frequency').click();
    await page.getByRole('option', { name: 'Weekly' }).click();
    
    // Set specific days
    await page.getByLabel('Monday').click();
    await page.getByLabel('Wednesday').click();
    await page.getByLabel('Friday').click();
    
    // Set end condition
    await page.locator('#end-condition').click();
    await page.getByRole('option', { name: 'After' }).click();
    await page.locator('#end-after-occurrences').fill('10');
    
    await page.getByRole('button', { name: 'Create Task' }).click();
    
    // Verify recurring task was created
    await expect(page.getByText('Recurring Task')).toBeVisible();
    await expect(page.getByText('Weekly')).toBeVisible();
  });

  test('User can manage tags and priorities', async ({ page }) => {
    // Login with existing user
    await page.getByRole('link', { name: 'Login' }).click();
    await page.locator('#email').fill(testUser.email);
    await page.locator('#password').fill(testUser.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Navigate to tags page
    await page.getByRole('link', { name: 'Tags' }).click();
    
    // Create a new tag
    await page.getByRole('button', { name: 'Create New Tag' }).click();
    
    await page.locator('#tag-name').fill('Personal');
    await page.locator('#tag-color').fill('#FF6B6B');
    
    await page.getByRole('button', { name: 'Create Tag' }).click();
    
    // Verify tag was created
    await expect(page.getByText('Personal')).toBeVisible();
    
    // Go back to tasks page
    await page.getByRole('link', { name: 'Tasks' }).click();
    
    // Create a task with the new tag
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    await page.locator('#title').fill('Task with Personal Tag');
    await page.locator('#description').fill('This task has a personal tag');
    
    // Select the personal tag
    await page.getByText('#Personal').click();
    
    await page.getByRole('button', { name: 'Create Task' }).click();
    
    // Verify task was created with the tag
    await expect(page.getByText('Task with Personal Tag')).toBeVisible();
    await expect(page.getByText('#Personal')).toBeVisible();
  });

  test('User can customize notification preferences', async ({ page }) => {
    // Login with existing user
    await page.getByRole('link', { name: 'Login' }).click();
    await page.locator('#email').fill(testUser.email);
    await page.locator('#password').fill(testUser.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Navigate to profile page
    await page.getByRole('link', { name: 'Profile' }).click();
    
    // Change notification preferences
    await page.locator('#email-notifications').click();
    await page.locator('#browser-notifications').click();
    
    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify preferences were saved
    await expect(page.getByText('Preferences saved successfully')).toBeVisible();
  });
});