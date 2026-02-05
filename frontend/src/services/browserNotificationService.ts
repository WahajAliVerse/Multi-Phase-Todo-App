import { Reminder } from '../models/reminder';

/**
 * Handles browser notifications for reminders
 */
export class BrowserNotificationService {
  /**
   * Requests permission to show browser notifications
   * @returns Promise that resolves to the permission status
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return 'denied' as NotificationPermission;
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  /**
   * Shows a browser notification for a reminder
   * @param reminder The reminder to notify about
   * @param taskTitle The title of the task associated with the reminder
   * @returns Promise that resolves when the notification is shown
   */
  static async showNotification(reminder: Reminder, taskTitle: string): Promise<void> {
    const permission = await this.requestPermission();

    if (permission === 'granted') {
      const notification = new Notification('Task Reminder', {
        body: `Time for your task: ${taskTitle}`,
        icon: '/favicon.ico',
        tag: reminder.id, // Use reminder ID as tag to prevent duplicates
      });

      // Optional: Handle notification events
      notification.onclick = () => {
        // Bring the app window to focus when clicked
        if (window.parent) {
          window.focus();
        }
      };

      // Optional: Handle notification close event
      notification.onclose = () => {
        console.log('Notification closed');
      };
    } else if (permission === 'denied') {
      console.warn('Notification permission denied');
      // In a real app, you might want to show an in-app notification instead
    }
  }

  /**
   * Checks if browser notifications are supported
   * @returns True if browser notifications are supported, false otherwise
   */
  static isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Gets the current notification permission status
   * @returns The current permission status
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied' as NotificationPermission;
    }
    return Notification.permission;
  }

  /**
   * Closes a notification by tag
   * @param tag The tag of the notification to close
   */
  static closeNotification(tag: string): void {
    // Note: The Notification API doesn't provide a way to close notifications programmatically
    // This is just a placeholder for future implementation if needed
    console.log(`Notification with tag ${tag} would be closed if supported`);
  }

  /**
   * Shows a notification with custom options
   * @param title The title of the notification
   * @param options The notification options
   * @returns Promise that resolves when the notification is shown
   */
  static async showCustomNotification(
    title: string,
    options: NotificationOptions
  ): Promise<void> {
    const permission = await this.requestPermission();

    if (permission === 'granted') {
      new Notification(title, options);
    }
  }
}