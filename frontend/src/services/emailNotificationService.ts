import { Reminder } from '../models/reminder';

/**
 * Service for sending email notifications
 */
export class EmailNotificationService {
  /**
   * Sends an email notification for a reminder
   * @param reminder The reminder to send an email for
   * @param taskTitle The title of the task associated with the reminder
   * @param recipientEmail The email address of the recipient
   * @returns Promise that resolves when the email is sent
   */
  static async sendEmailNotification(
    reminder: Reminder,
    taskTitle: string,
    recipientEmail: string
  ): Promise<void> {
    try {
      // Prepare the email payload
      const emailPayload = {
        to: recipientEmail,
        subject: `Task Reminder: ${taskTitle}`,
        html: this.createEmailTemplate(taskTitle, reminder),
        text: this.createEmailText(taskTitle, reminder),
      };

      // Send the email via the API
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`, // Assuming JWT auth
        },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        throw new Error(`Email service responded with status ${response.status}`);
      }

      console.log(`Email reminder sent successfully to ${recipientEmail}`);
    } catch (error) {
      console.error('Failed to send email reminder:', error);
      throw error;
    }
  }

  /**
   * Creates the HTML template for the email
   * @param taskTitle The title of the task
   * @param reminder The reminder details
   * @returns HTML string for the email
   */
  private static createEmailTemplate(taskTitle: string, reminder: Reminder): string {
    const scheduledTime = new Date(reminder.scheduledTime).toLocaleString();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Task Reminder</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <header style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">Task Reminder</h1>
            </header>
            
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #111827; margin-top: 0;">${taskTitle}</h2>
              
              <p>You're receiving this reminder because you have a task scheduled for attention:</p>
              
              <div style="background: white; border-radius: 6px; padding: 20px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Task:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${taskTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Scheduled for:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${scheduledTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px;"><strong>Delivery methods:</strong></td>
                    <td style="padding: 8px;">${reminder.deliveryMethods.join(', ')}</td>
                  </tr>
                </table>
              </div>
              
              <p>If you've already completed this task, you can disregard this message.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.9em;">
                <p>This is an automated reminder from the Todo App. You received this email because you have a reminder set for a task.</p>
                <p>If you believe you received this email in error, please contact support.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Creates the plain text version of the email
   * @param taskTitle The title of the task
   * @param reminder The reminder details
   * @returns Plain text string for the email
   */
  private static createEmailText(taskTitle: string, reminder: Reminder): string {
    const scheduledTime = new Date(reminder.scheduledTime).toLocaleString();

    return `
      Task Reminder: ${taskTitle}
      
      You're receiving this reminder because you have a task scheduled for attention:
      
      Task: ${taskTitle}
      Scheduled for: ${scheduledTime}
      Delivery methods: ${reminder.deliveryMethods.join(', ')}
      
      If you've already completed this task, you can disregard this message.
      
      --
      This is an automated reminder from the Todo App. 
      You received this email because you have a reminder set for a task.
      If you believe you received this email in error, please contact support.
    `;
  }

  /**
   * Validates an email address
   * @param email The email address to validate
   * @returns True if the email is valid, false otherwise
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Batch sends email notifications
   * @param remindersWithDetails Array of reminders with associated task titles and recipient emails
   * @returns Promise that resolves when all emails are sent
   */
  static async sendBatchEmailNotifications(
    remindersWithDetails: Array<{
      reminder: Reminder;
      taskTitle: string;
      recipientEmail: string;
    }>
  ): Promise<void> {
    const results = await Promise.allSettled(
      remindersWithDetails.map(item => 
        this.sendEmailNotification(item.reminder, item.taskTitle, item.recipientEmail)
      )
    );

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send email notification for reminder ${remindersWithDetails[index].reminder.id}:`, result.reason);
      }
    });
  }
}