// Service for handling browser notifications
class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    this.permission = Notification.permission;
  }

  // Request notification permission from the user
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission;
  }

  // Check if browser supports notifications
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.permission === 'granted';
  }

  // Show a notification
  showNotification(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isSupported() || !this.isEnabled()) {
      console.warn('Notifications not supported or not enabled');
      return null;
    }

    return new Notification(title, options);
  }

  // Show a task reminder notification
  showTaskReminder(taskTitle: string, dueDate?: string): void {
    const title = `Task Reminder: ${taskTitle}`;
    const body = dueDate 
      ? `This task is due on ${new Date(dueDate).toLocaleString()}` 
      : 'This task needs attention.';
    
    this.showNotification(title, {
      body,
      icon: '/favicon.ico',
      tag: `task-${taskTitle}`,
      requireInteraction: false,
    });
  }

  // Schedule a notification for a future time
  scheduleNotification(title: string, body: string, timestamp: number, tag: string): void {
    const delay = timestamp - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        this.showNotification(title, { body, tag });
      }, delay);
    }
  }

  // Show a notification for task completion
  showTaskCompletion(taskTitle: string): void {
    this.showNotification('Task Completed!', {
      body: `"${taskTitle}" has been marked as completed.`,
      icon: '/favicon.ico',
      tag: `completion-${taskTitle}`,
    });
  }

  // Show a notification for task creation
  showTaskCreated(taskTitle: string): void {
    this.showNotification('Task Created!', {
      body: `"${taskTitle}" has been added to your list.`,
      icon: '/favicon.ico',
      tag: `created-${taskTitle}`,
    });
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();

export default notificationService;