import { Reminder } from '../models/reminder';
import { BrowserNotificationService } from './browserNotificationService';

/**
 * Service for scheduling and managing reminders
 */
export class ReminderScheduler {
  private static scheduledReminders: Map<string, number> = new Map();

  /**
   * Schedules a reminder to be delivered at the specified time
   * @param reminder The reminder to schedule
   * @returns Promise that resolves when the reminder is scheduled
   */
  static async scheduleReminder(reminder: Reminder): Promise<void> {
    // Cancel any existing scheduled reminder with the same ID
    this.cancelReminder(reminder.id);

    // Calculate the time until the reminder should be delivered
    const scheduledTime = new Date(reminder.scheduledTime);
    const currentTime = new Date();
    const timeUntilDelivery = scheduledTime.getTime() - currentTime.getTime();

    if (timeUntilDelivery <= 0) {
      // If the scheduled time has already passed, deliver immediately
      await this.deliverReminder(reminder);
      return;
    }

    // Schedule the reminder using setTimeout
    const timeoutId = window.setTimeout(async () => {
      await this.deliverReminder(reminder);
      // Remove from scheduled map after execution
      this.scheduledReminders.delete(reminder.id);
    }, timeUntilDelivery);

    // Store the timeout ID so we can cancel if needed
    this.scheduledReminders.set(reminder.id, timeoutId);
  }

  /**
   * Schedules multiple reminders
   * @param reminders The reminders to schedule
   * @returns Promise that resolves when all reminders are scheduled
   */
  static async scheduleReminders(reminders: Reminder[]): Promise<void> {
    for (const reminder of reminders) {
      await this.scheduleReminder(reminder);
    }
  }

  /**
   * Cancels a scheduled reminder
   * @param reminderId The ID of the reminder to cancel
   */
  static cancelReminder(reminderId: string): void {
    const timeoutId = this.scheduledReminders.get(reminderId);
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      this.scheduledReminders.delete(reminderId);
    }
  }

  /**
   * Cancels all scheduled reminders
   */
  static cancelAllReminders(): void {
    for (const [id, timeoutId] of this.scheduledReminders) {
      clearTimeout(timeoutId);
    }
    this.scheduledReminders.clear();
  }

  /**
   * Delivers a reminder using the specified delivery methods
   * @param reminder The reminder to deliver
   * @returns Promise that resolves when the reminder is delivered
   */
  private static async deliverReminder(reminder: Reminder): Promise<void> {
    // Update the reminder's delivery status to 'sent'
    await this.updateReminderStatus(reminder.id, 'sent');

    try {
      // Deliver using each specified method
      for (const method of reminder.deliveryMethods) {
        switch (method) {
          case 'browser':
            await this.deliverBrowserNotification(reminder);
            break;
          case 'email':
            await this.deliverEmailNotification(reminder);
            break;
          case 'inApp':
            await this.deliverInAppNotification(reminder);
            break;
          default:
            console.warn(`Unknown delivery method: ${method}`);
        }
      }

      // Update the reminder's status to delivered
      await this.updateReminderStatus(reminder.id, 'delivered');
    } catch (error) {
      console.error(`Failed to deliver reminder ${reminder.id}:`, error);
      // Update the reminder's status to failed
      await this.updateReminderStatus(reminder.id, 'failed');
    }
  }

  /**
   * Delivers a browser notification
   * @param reminder The reminder to deliver
   * @returns Promise that resolves when the notification is delivered
   */
  private static async deliverBrowserNotification(reminder: Reminder): Promise<void> {
    // In a real implementation, we would fetch the task title to include in the notification
    // For now, we'll use a placeholder
    await BrowserNotificationService.showNotification(reminder, `Task reminder: ${reminder.id}`);
  }

  /**
   * Delivers an email notification
   * @param reminder The reminder to deliver
   * @returns Promise that resolves when the email is delivered
   */
  private static async deliverEmailNotification(reminder: Reminder): Promise<void> {
    // In a real implementation, this would send an email via an email service
    // For now, we'll just log that an email would be sent
    console.log(`Would send email reminder for task ${reminder.taskId} at ${reminder.scheduledTime}`);
    
    // This would typically involve calling an email service API
    // await emailService.send({
    //   to: await this.getUserEmail(reminder.taskId),
    //   subject: 'Task Reminder',
    //   body: `Don't forget your task: ${await this.getTaskTitle(reminder.taskId)}`
    // });
  }

  /**
   * Delivers an in-app notification
   * @param reminder The reminder to deliver
   * @returns Promise that resolves when the in-app notification is delivered
   */
  private static async deliverInAppNotification(reminder: Reminder): Promise<void> {
    // In a real implementation, this would add the notification to the user's in-app notification feed
    // For now, we'll just log that an in-app notification would be sent
    console.log(`Would send in-app reminder for task ${reminder.taskId} at ${reminder.scheduledTime}`);
    
    // This would typically involve updating the app's state to show the notification
    // store.dispatch(addInAppNotification({
    //   id: reminder.id,
    //   message: `Time for your task: ${await this.getTaskTitle(reminder.taskId)}`,
    //   timestamp: new Date().toISOString(),
    //   taskId: reminder.taskId
    // }));
  }

  /**
   * Updates the status of a reminder
   * @param reminderId The ID of the reminder to update
   * @param status The new status
   * @returns Promise that resolves when the status is updated
   */
  private static async updateReminderStatus(reminderId: string, status: Reminder['deliveryStatus']): Promise<void> {
    // In a real implementation, this would update the reminder in the database
    // For now, we'll just log the status update
    console.log(`Updating reminder ${reminderId} status to ${status}`);
    
    // This would typically involve calling an API endpoint
    // await api.updateReminder(reminderId, { deliveryStatus: status, sentAt: new Date().toISOString() });
  }

  /**
   * Gets the current number of scheduled reminders
   * @returns The number of scheduled reminders
   */
  static getScheduledCount(): number {
    return this.scheduledReminders.size;
  }

  /**
   * Gets the IDs of all scheduled reminders
   * @returns Array of scheduled reminder IDs
   */
  static getScheduledIds(): string[] {
    return Array.from(this.scheduledReminders.keys());
  }
}