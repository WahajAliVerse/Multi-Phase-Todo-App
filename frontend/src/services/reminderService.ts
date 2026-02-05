import { Reminder } from '../models/reminder';

export class ReminderService {
  /**
   * Schedules a reminder to be delivered at the specified time
   * @param reminder The reminder to schedule
   * @returns Promise that resolves when the reminder is scheduled
   */
  static async scheduleReminder(reminder: Reminder): Promise<void> {
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
    setTimeout(async () => {
      await this.deliverReminder(reminder);
    }, timeUntilDelivery);
  }

  /**
   * Delivers a reminder using the specified delivery methods
   * @param reminder The reminder to deliver
   * @returns Promise that resolves when the reminder is delivered
   */
  private static async deliverReminder(reminder: Reminder): Promise<void> {
    // Update the reminder's delivery status
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
    // Check if browser notifications are supported
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return;
    }

    // Check if we have permission to show notifications
    if (Notification.permission === 'granted') {
      // Show the notification
      new Notification('Task Reminder', {
        body: `Time for your task: ${await this.getTaskTitle(reminder.taskId)}`,
        icon: '/favicon.ico',
      });
    } else if (Notification.permission !== 'denied') {
      // Request permission to show notifications
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Show the notification
        new Notification('Task Reminder', {
          body: `Time for your task: ${await this.getTaskTitle(reminder.taskId)}`,
          icon: '/favicon.ico',
        });
      }
    }
  }

  /**
   * Delivers an email notification
   * @param reminder The reminder to deliver
   * @returns Promise that resolves when the email is delivered
   */
  private static async deliverEmailNotification(reminder: Reminder): Promise<void> {
    // In a real implementation, this would send an email
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
   * Gets the title of a task by its ID
   * @param taskId The ID of the task
   * @returns Promise that resolves to the task title
   */
  private static async getTaskTitle(taskId: string): Promise<string> {
    // In a real implementation, this would fetch the task from the database
    // For now, we'll return a placeholder
    return `Task ${taskId}`;
  }

  /**
   * Gets the user's email by task ID
   * @param taskId The ID of the task
   * @returns Promise that resolves to the user's email
   */
  private static async getUserEmail(taskId: string): Promise<string> {
    // In a real implementation, this would fetch the user's email from the database
    // For now, we'll return a placeholder
    return 'user@example.com';
  }

  /**
   * Schedules all reminders for a task
   * @param reminders The reminders to schedule
   */
  static scheduleAllReminders(reminders: Reminder[]): void {
    for (const reminder of reminders) {
      this.scheduleReminder(reminder);
    }
  }

  /**
   * Cancels a scheduled reminder
   * @param reminderId The ID of the reminder to cancel
   */
  static cancelReminder(reminderId: string): void {
    // In a real implementation, this would cancel the scheduled reminder
    // For now, we'll just log that the reminder was cancelled
    console.log(`Cancelled reminder ${reminderId}`);
  }

  /**
   * Snoozes a reminder for a specified duration
   * @param reminderId The ID of the reminder to snooze
   * @param durationMinutes The duration to snooze in minutes
   * @returns Promise that resolves when the reminder is snoozed
   */
  static async snoozeReminder(reminderId: string, durationMinutes: number): Promise<void> {
    // In a real implementation, this would update the reminder's scheduled time
    // For now, we'll just log that the reminder was snoozed
    console.log(`Snoozed reminder ${reminderId} for ${durationMinutes} minutes`);
    
    // Calculate the new scheduled time
    const newScheduledTime = new Date();
    newScheduledTime.setMinutes(newScheduledTime.getMinutes() + durationMinutes);
    
    // Update the reminder with the new scheduled time
    // await api.updateReminder(reminderId, { scheduledTime: newScheduledTime.toISOString() });
  }
}