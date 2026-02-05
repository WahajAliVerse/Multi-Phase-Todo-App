import { Reminder } from '../models/reminder';
import { BrowserNotificationService } from './browserNotificationService';
import { EmailNotificationService } from './emailNotificationService';

/**
 * Service for delivering notifications through multiple channels
 */
export class MultiChannelNotificationService {
  /**
   * Delivers a reminder through all specified channels
   * @param reminder The reminder to deliver
   * @param taskTitle The title of the task associated with the reminder
   * @param recipientEmail The email address of the recipient (for email notifications)
   * @returns Promise that resolves when the reminder is delivered through all channels
   */
  static async deliverMultiChannelNotification(
    reminder: Reminder,
    taskTitle: string,
    recipientEmail: string
  ): Promise<void> {
    const deliveryResults: Array<{ channel: string; success: boolean; error?: any }> = [];

    // Deliver through each specified channel
    for (const channel of reminder.deliveryMethods) {
      try {
        switch (channel) {
          case 'browser':
            await this.deliverBrowserNotification(reminder, taskTitle);
            deliveryResults.push({ channel, success: true });
            break;
          case 'email':
            await this.deliverEmailNotification(reminder, taskTitle, recipientEmail);
            deliveryResults.push({ channel, success: true });
            break;
          case 'inApp':
            await this.deliverInAppNotification(reminder, taskTitle);
            deliveryResults.push({ channel, success: true });
            break;
          default:
            throw new Error(`Unknown delivery channel: ${channel}`);
        }
      } catch (error) {
        console.error(`Failed to deliver reminder through ${channel} channel:`, error);
        deliveryResults.push({ channel, success: false, error });
      }
    }

    // Log delivery summary
    const successfulDeliveries = deliveryResults.filter(r => r.success).length;
    const totalChannels = reminder.deliveryMethods.length;
    
    console.log(`Reminder ${reminder.id} delivered: ${successfulDeliveries}/${totalChannels} channels`);

    // If no channels succeeded, throw an error
    if (successfulDeliveries === 0) {
      throw new Error(`Failed to deliver reminder ${reminder.id} through any channel: ${deliveryResults.map(r => r.error).join('; ')}`);
    }

    // If some channels failed, log which ones
    const failedChannels = deliveryResults.filter(r => !r.success).map(r => r.channel);
    if (failedChannels.length > 0) {
      console.warn(`Reminder ${reminder.id} failed on channels: ${failedChannels.join(', ')}`);
    }
  }

  /**
   * Delivers a browser notification
   * @param reminder The reminder to deliver
   * @param taskTitle The title of the task
   * @returns Promise that resolves when the notification is delivered
   */
  private static async deliverBrowserNotification(reminder: Reminder, taskTitle: string): Promise<void> {
    await BrowserNotificationService.showNotification(
      reminder,
      `Task Reminder: ${taskTitle}`
    );
  }

  /**
   * Delivers an email notification
   * @param reminder The reminder to deliver
   * @param taskTitle The title of the task
   * @param recipientEmail The recipient's email address
   * @returns Promise that resolves when the email is delivered
   */
  private static async deliverEmailNotification(reminder: Reminder, taskTitle: string, recipientEmail: string): Promise<void> {
    await EmailNotificationService.sendEmailNotification(reminder, taskTitle, recipientEmail);
  }

  /**
   * Delivers an in-app notification
   * @param reminder The reminder to deliver
   * @param taskTitle The title of the task
   * @returns Promise that resolves when the in-app notification is delivered
   */
  private static async deliverInAppNotification(reminder: Reminder, taskTitle: string): Promise<void> {
    // In a real implementation, this would add the notification to the user's in-app notification feed
    // For now, we'll just log that an in-app notification would be sent
    console.log(`Would send in-app reminder for task ${reminder.taskId} at ${reminder.scheduledTime}: ${taskTitle}`);
    
    // This would typically involve updating the app's state to show the notification
    // store.dispatch(addInAppNotification({
    //   id: reminder.id,
    //   message: `Time for your task: ${taskTitle}`,
    //   timestamp: new Date().toISOString(),
    //   taskId: reminder.taskId
    // }));
  }

  /**
   * Batch delivers notifications through multiple channels
   * @param notifications Array of notification objects with reminder, task title, and recipient email
   * @returns Promise that resolves when all notifications are delivered
   */
  static async deliverBatchMultiChannelNotifications(
    notifications: Array<{
      reminder: Reminder;
      taskTitle: string;
      recipientEmail: string;
    }>
  ): Promise<void> {
    const results = await Promise.allSettled(
      notifications.map(notification => 
        this.deliverMultiChannelNotification(
          notification.reminder,
          notification.taskTitle,
          notification.recipientEmail
        )
      )
    );

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to deliver multi-channel notification for reminder ${notifications[index].reminder.id}:`, result.reason);
      }
    });
  }

  /**
   * Validates that a reminder has at least one delivery method
   * @param reminder The reminder to validate
   * @returns True if the reminder has valid delivery methods, false otherwise
   */
  static isValidReminder(reminder: Reminder): boolean {
    return reminder.deliveryMethods && reminder.deliveryMethods.length > 0;
  }

  /**
   * Validates that all specified delivery methods are supported
   * @param deliveryMethods The delivery methods to validate
   * @returns True if all methods are supported, false otherwise
   */
  static areValidDeliveryMethods(deliveryMethods: string[]): boolean {
    const supportedMethods = ['browser', 'email', 'inApp'];
    return deliveryMethods.every(method => supportedMethods.includes(method));
  }
}