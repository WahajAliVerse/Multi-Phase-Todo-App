import { Reminder } from '../models/reminder';
import { ReminderService } from './reminderService';

interface SnoozeOption {
  label: string;
  minutes: number;
}

export class ReminderActionsService {
  /**
   * Default snooze options
   */
  static readonly DEFAULT_SNOOZE_OPTIONS: SnoozeOption[] = [
    { label: '5 minutes', minutes: 5 },
    { label: '10 minutes', minutes: 10 },
    { label: '30 minutes', minutes: 30 },
    { label: '1 hour', minutes: 60 },
    { label: '3 hours', minutes: 180 },
    { label: 'Tomorrow', minutes: 24 * 60 }, // 24 hours
  ];

  /**
   * Snoozes a reminder for a specified duration
   * @param reminderId The ID of the reminder to snooze
   * @param durationMinutes The duration to snooze in minutes
   * @returns Promise that resolves when the reminder is snoozed
   */
  static async snoozeReminder(reminderId: string, durationMinutes: number): Promise<void> {
    try {
      // In a real implementation, this would update the reminder's scheduled time
      // For now, we'll just log that the reminder was snoozed
      console.log(`Snoozing reminder ${reminderId} for ${durationMinutes} minutes`);
      
      // Call the ReminderService to handle the snooze logic
      await ReminderService.snoozeReminder(reminderId, durationMinutes);
    } catch (error) {
      console.error(`Failed to snooze reminder ${reminderId}:`, error);
      throw error;
    }
  }

  /**
   * Dismisses a reminder (marks it as handled)
   * @param reminderId The ID of the reminder to dismiss
   * @returns Promise that resolves when the reminder is dismissed
   */
  static async dismissReminder(reminderId: string): Promise<void> {
    try {
      // In a real implementation, this would update the reminder's status
      // For now, we'll just log that the reminder was dismissed
      console.log(`Dismissing reminder ${reminderId}`);
      
      // This would typically involve calling an API endpoint to update the reminder status
      // await api.updateReminder(reminderId, { deliveryStatus: 'delivered', sentAt: new Date().toISOString() });
    } catch (error) {
      console.error(`Failed to dismiss reminder ${reminderId}:`, error);
      throw error;
    }
  }

  /**
   * Gets the default snooze options
   * @returns Array of snooze options
   */
  static getSnoozeOptions(): SnoozeOption[] {
    return this.DEFAULT_SNOOZE_OPTIONS;
  }

  /**
   * Formats a duration in minutes to a human-readable string
   * @param minutes The duration in minutes
   * @returns Formatted string
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 24 * 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / (24 * 60));
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Calculates the new scheduled time for a snoozed reminder
   * @param currentTime The current time
   * @param durationMinutes The duration to snooze in minutes
   * @returns The new scheduled time
   */
  static calculateSnoozeTime(currentTime: Date, durationMinutes: number): Date {
    const newTime = new Date(currentTime);
    newTime.setMinutes(newTime.getMinutes() + durationMinutes);
    return newTime;
  }

  /**
   * Handles a reminder action (snooze or dismiss)
   * @param reminder The reminder to handle
   * @param action The action to take ('snooze' or 'dismiss')
   * @param snoozeDurationMinutes The duration to snooze in minutes (only used if action is 'snooze')
   * @returns Promise that resolves when the action is handled
   */
  static async handleReminderAction(
    reminder: Reminder,
    action: 'snooze' | 'dismiss',
    snoozeDurationMinutes?: number
  ): Promise<void> {
    if (action === 'snooze') {
      if (snoozeDurationMinutes === undefined) {
        throw new Error('Snooze duration must be provided when action is snooze');
      }
      await this.snoozeReminder(reminder.id, snoozeDurationMinutes);
    } else if (action === 'dismiss') {
      await this.dismissReminder(reminder.id);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  }
}