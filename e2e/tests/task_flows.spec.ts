import pytest
from playwright.sync_api import Page, expect
import os


@pytest.fixture(autouse=True)
def setup_and_teardown(page: Page):
    # Setup: Navigate to the application
    base_url = os.getenv("BASE_URL", "http://localhost:3000")
    page.goto(base_url)
    
    yield page  # This is where the test runs
    
    # Teardown: Clean up after test if needed
    # Any cleanup code would go here


def test_user_registration_flow(page: Page):
    """Test the complete user registration flow"""
    # Navigate to registration page
    page.get_by_role("link", name="Register").click()
    expect(page).to_have_url(f"{page.url}/register")
    
    # Fill in registration form
    page.get_by_label("First Name").fill("John")
    page.get_by_label("Last Name").fill("Doe")
    page.get_by_label("Email").fill("johndoe@example.com")
    page.get_by_label("Password").fill("SecurePass123!")
    page.get_by_label("Confirm Password").fill("SecurePass123!")
    
    # Submit registration
    page.get_by_role("button", name="Register").click()
    
    # Verify registration success (redirect to dashboard or similar)
    expect(page).to_have_url(f"{page.url}/dashboard")
    expect(page.get_by_text("Welcome, John")).to_be_visible()


def test_user_login_logout_flow(page: Page):
    """Test the complete user login and logout flow"""
    # Navigate to login page
    page.get_by_role("link", name="Login").click()
    expect(page).to_have_url(f"{page.url}/login")
    
    # Fill in login form
    page.get_by_label("Email").fill("johndoe@example.com")
    page.get_by_label("Password").fill("SecurePass123!")
    
    # Submit login
    page.get_by_role("button", name="Sign In").click()
    
    # Verify login success (redirect to dashboard)
    expect(page).to_have_url(f"{page.url}/dashboard")
    expect(page.get_by_text("Welcome, John")).to_be_visible()
    
    # Test logout
    page.get_by_role("button", name="Logout").click()
    
    # Verify logout success (redirect to login)
    expect(page).to_have_url(f"{page.url}/login")
    expect(page.get_by_text("Please log in")).to_be_visible()


def test_task_creation_and_management_flow(page: Page):
    """Test the complete task creation and management flow"""
    # First, log in (assuming user is already registered)
    page.goto(f"{page.url}/login")
    page.get_by_label("Email").fill("johndoe@example.com")
    page.get_by_label("Password").fill("SecurePass123!")
    page.get_by_role("button", name="Sign In").click()
    
    # Verify we're on the dashboard
    expect(page).to_have_url(f"{page.url}/dashboard")
    
    # Navigate to tasks page
    page.get_by_role("link", name="Tasks").click()
    expect(page).to_have_url(f"{page.url}/tasks")
    
    # Create a new task
    page.get_by_role("button", name="Add Task").click()
    
    # Fill in task details
    page.locator("#title").fill("Test Task")
    page.locator("#description").fill("This is a test task description")
    
    # Select priority
    page.locator("[data-testid='priority-select']").click()
    page.get_by_role("option", name="High").click()
    
    # Set due date
    page.locator("#due_date").fill("2023-12-31T10:00")
    
    # Submit task
    page.get_by_role("button", name="Create Task").click()
    
    # Verify task was created
    expect(page.get_by_text("Test Task")).to_be_visible()
    expect(page.get_by_text("This is a test task description")).to_be_visible()
    
    # Test editing the task
    page.get_by_role("button", name="Edit").click()
    
    # Modify task details
    page.locator("#title").fill("Updated Test Task")
    page.get_by_role("button", name="Update Task").click()
    
    # Verify task was updated
    expect(page.get_by_text("Updated Test Task")).to_be_visible()
    
    # Test marking task as complete
    page.get_by_label("Mark as completed").click()
    
    # Verify task status changed
    expect(page.get_by_text("completed")).to_be_visible()
    
    # Test deleting the task
    page.get_by_role("button", name="Delete").click()
    
    # Confirm deletion if there's a confirmation dialog
    if page.locator("[data-testid='confirm-delete']").is_visible():
        page.get_by_role("button", name="Confirm").click()
    
    # Verify task was deleted
    expect(page.get_by_text("Updated Test Task")).not_to_be_visible()


def test_task_filtering_and_sorting_flow(page: Page):
    """Test filtering and sorting tasks functionality"""
    # Log in first
    page.goto(f"{page.url}/login")
    page.get_by_label("Email").fill("johndoe@example.com")
    page.get_by_label("Password").fill("SecurePass123!")
    page.get_by_role("button", name="Sign In").click()
    
    # Navigate to tasks page
    page.get_by_role("link", name="Tasks").click()
    
    # Create multiple tasks with different priorities
    # Task 1: High priority
    page.get_by_role("button", name="Add Task").click()
    page.locator("#title").fill("High Priority Task")
    page.locator("[data-testid='priority-select']").click()
    page.get_by_role("option", name="High").click()
    page.get_by_role("button", name="Create Task").click()
    
    # Task 2: Low priority
    page.get_by_role("button", name="Add Task").click()
    page.locator("#title").fill("Low Priority Task")
    page.locator("[data-testid='priority-select']").click()
    page.get_by_role("option", name="Low").click()
    page.get_by_role("button", name="Create Task").click()
    
    # Task 3: Medium priority
    page.get_by_role("button", name="Add Task").click()
    page.locator("#title").fill("Medium Priority Task")
    page.locator("[data-testid='priority-select']").click()
    page.get_by_role("option", name="Medium").click()
    page.get_by_role("button", name="Create Task").click()
    
    # Test filtering by priority
    page.locator("[data-testid='filter-priority']").click()
    page.get_by_role("option", name="High").click()
    
    # Verify only high priority tasks are shown
    expect(page.get_by_text("High Priority Task")).to_be_visible()
    expect(page.get_by_text("Low Priority Task")).not_to_be_visible()
    expect(page.get_by_text("Medium Priority Task")).not_to_be_visible()
    
    # Test sorting by priority
    page.locator("[data-testid='sort-select']").click()
    page.get_by_role("option", name="Priority").click()
    
    # Verify tasks are sorted by priority
    task_list = page.locator(".task-item")
    first_task = task_list.first.inner_text()
    assert "High Priority Task" in first_task


def test_recurring_task_creation_flow(page: Page):
    """Test creating and managing recurring tasks"""
    # Log in first
    page.goto(f"{page.url}/login")
    page.get_by_label("Email").fill("johndoe@example.com")
    page.get_by_label("Password").fill("SecurePass123!")
    page.get_by_role("button", name="Sign In").click()
    
    # Navigate to tasks page
    page.get_by_role("link", name="Tasks").click()
    
    # Create a recurring task
    page.get_by_role("button", name="Add Task").click()
    
    # Fill in task details
    page.locator("#title").fill("Recurring Task")
    page.locator("#description").fill("This task repeats weekly")
    
    # Enable recurrence
    page.get_by_role("button", name="Enable Recurrence").click()
    
    # Set recurrence pattern
    page.locator("[data-testid='recurrence-frequency']").click()
    page.get_by_role("option", name="Weekly").click()
    
    # Set specific days
    page.get_by_label("Monday").click()
    page.get_by_label("Wednesday").click()
    page.get_by_label("Friday").click()
    
    # Set end condition
    page.locator("[data-testid='end-condition']").click()
    page.get_by_role("option", name="After").click()
    page.locator("#end-after-occurrences").fill("10")
    
    # Submit task
    page.get_by_role("button", name="Create Task").click()
    
    # Verify recurring task was created
    expect(page.get_by_text("Recurring Task")).to_be_visible()
    expect(page.get_by_text("Weekly")).to_be_visible()


def test_notification_preferences_flow(page: Page):
    """Test configuring notification preferences"""
    # Log in first
    page.goto(f"{page.url}/login")
    page.get_by_label("Email").fill("johndoe@example.com")
    page.get_by_label("Password").fill("SecurePass123!")
    page.get_by_role("button", name="Sign In").click()
    
    # Navigate to profile page
    page.get_by_role("link", name="Profile").click()
    
    # Verify notification settings section is visible
    expect(page.get_by_text("Notification Preferences")).to_be_visible()
    
    # Toggle email notifications
    email_toggle = page.locator("[data-testid='email-notification-toggle']")
    initial_state = email_toggle.is_checked()
    email_toggle.click()
    
    # Verify the toggle changed state
    expect(email_toggle).not_to_be_checked() if initial_state else expect(email_toggle).to_be_checked()
    
    # Toggle browser notifications
    browser_toggle = page.locator("[data-testid='browser-notification-toggle']")
    initial_state = browser_toggle.is_checked()
    browser_toggle.click()
    
    # Verify the toggle changed state
    expect(browser_toggle).not_to_be_checked() if initial_state else expect(browser_toggle).to_be_checked()
    
    # Save settings
    page.get_by_role("button", name="Save Changes").click()
    
    # Verify success message
    expect(page.get_by_text("Settings saved successfully")).to_be_visible()


def test_theme_switching_flow(page: Page):
    """Test switching between light and dark themes"""
    # Log in first
    page.goto(f"{page.url}/login")
    page.get_by_label("Email").fill("johndoe@example.com")
    page.get_by_label("Password").fill("SecurePass123!")
    page.get_by_role("button", name="Sign In").click()
    
    # Get initial theme class
    body = page.locator("body")
    initial_theme_class = body.get_attribute("class")
    
    # Click theme toggle
    page.locator("[data-testid='theme-toggle']").click()
    
    # Wait for theme change to take effect
    page.wait_for_timeout(300)
    
    # Get new theme class
    new_theme_class = body.get_attribute("class")
    
    # Verify theme changed
    assert initial_theme_class != new_theme_class