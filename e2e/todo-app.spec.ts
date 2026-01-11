import { test, expect } from '@playwright/test';

test.describe('Todo App End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should allow creating, updating, and deleting a task', async ({ page }) => {
    // Create a new task
    await page.locator('button[aria-label="add task"]').click();
    
    // Fill in the task details
    await page.locator('input[placeholder="Title"]').fill('Test Task');
    await page.locator('textarea').fill('This is a test task description');
    
    // Select priority
    await page.locator('label:has-text("Priority")').click();
    await page.locator('text=High').click();
    
    // Set due date
    await page.locator('input[type="datetime-local"]').fill('2023-12-31T10:00');
    
    // Submit the task
    await page.locator('button:has-text("Create Task")').click();
    
    // Verify the task was created
    await expect(page.locator('text="Test Task"')).toBeVisible();
    await expect(page.locator('text="This is a test task description"')).toBeVisible();
    
    // Update the task
    await page.locator('button:has-text("Edit")').first().click();
    await page.locator('input[placeholder="Title"]').fill('Updated Test Task');
    await page.locator('button:has-text("Update Task")').click();
    
    // Verify the task was updated
    await expect(page.locator('text="Updated Test Task"')).toBeVisible();
    
    // Mark the task as complete
    await page.locator('button[aria-label="CheckCircleOutlineIcon"]').first().click();
    
    // Verify the task is marked as complete
    await expect(page.locator('text="Completed"')).first().toBeVisible();
    
    // Delete the task
    await page.locator('button:has-text("Delete")').first().click();
    await page.locator('text="Are you sure you want to delete this task?"').isVisible();
    await page.locator('text="OK"').click(); // Assuming a confirmation dialog appears
    
    // Verify the task was deleted
    await expect(page.locator('text="Updated Test Task"')).not.toBeVisible();
  });

  test('should allow filtering tasks by status', async ({ page }) => {
    // Create a few tasks with different statuses
    await page.locator('button[aria-label="add task"]').click();
    await page.locator('input[placeholder="Title"]').fill('Active Task');
    await page.locator('button:has-text("Create Task")').click();
    
    await page.locator('button[aria-label="add task"]').click();
    await page.locator('input[placeholder="Title"]').fill('Completed Task');
    await page.locator('button:has-text("Create Task")').click();
    
    // Mark one task as complete
    await page.locator('button[aria-label="CheckCircleOutlineIcon"]').nth(1).click();
    
    // Apply status filter
    await page.locator('text="Status"').click();
    await page.locator('text="Active"').click();
    await page.locator('text="Apply"').click();
    
    // Verify only active tasks are shown
    await expect(page.locator('text="Active Task"')).toBeVisible();
    await expect(page.locator('text="Completed Task"')).not.toBeVisible();
  });

  test('should allow searching for tasks', async ({ page }) => {
    // Create a few tasks
    await page.locator('button[aria-label="add task"]').click();
    await page.locator('input[placeholder="Title"]').fill('Meeting Preparation');
    await page.locator('button:has-text("Create Task")').click();
    
    await page.locator('button[aria-label="add task"]').click();
    await page.locator('input[placeholder="Title"]').fill('Grocery Shopping');
    await page.locator('button:has-text("Create Task")').click();
    
    // Search for a task
    await page.locator('input[placeholder="Search tasks..."]').fill('Meeting');
    
    // Verify only matching tasks are shown
    await expect(page.locator('text="Meeting Preparation"')).toBeVisible();
    await expect(page.locator('text="Grocery Shopping"')).not.toBeVisible();
  });

  test('should allow sorting tasks', async ({ page }) => {
    // Create tasks with different priorities
    await page.locator('button[aria-label="add task"]').click();
    await page.locator('input[placeholder="Title"]').fill('Low Priority Task');
    await page.locator('label:has-text("Priority")').click();
    await page.locator('text=Low').click();
    await page.locator('button:has-text("Create Task")').click();
    
    await page.locator('button[aria-label="add task"]').click();
    await page.locator('input[placeholder="Title"]').fill('High Priority Task');
    await page.locator('label:has-text("Priority")').click();
    await page.locator('text=High').click();
    await page.locator('button:has-text("Create Task")').click();
    
    // Sort by priority
    await page.locator('text="Sort By"').click();
    await page.locator('text="Priority"').click();
    
    // Verify tasks are sorted by priority
    const firstTask = await page.locator('.MuiCard-root').first().textContent();
    expect(firstTask).toContain('High Priority Task');
  });

  test('should allow creating recurring tasks', async ({ page }) => {
    // Create a recurring task
    await page.locator('button[aria-label="add task"]').click();
    
    // Fill in task details
    await page.locator('input[placeholder="Title"]').fill('Recurring Task');
    await page.locator('textarea').fill('This is a recurring task');
    
    // Enable recurring task
    await page.locator('text="Recurring Task"').click();
    
    // Select pattern type
    await page.locator('text="Pattern Type"').click();
    await page.locator('text="Daily"').click();
    
    // Set interval
    await page.locator('input[label="Interval"]').fill('1');
    
    // Submit the task
    await page.locator('button:has-text("Create Pattern")').click();
    
    // Verify the recurring task was created
    await expect(page.locator('text="Recurring Task"')).toBeVisible();
    await expect(page.locator('text="Recurring"')).toBeVisible();
  });
});