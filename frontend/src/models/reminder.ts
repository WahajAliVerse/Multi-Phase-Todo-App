export interface Reminder {
  id: string;
  taskId: string;
  scheduledTime: string; // ISO string in UTC
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  deliveryMethods: ('browser' | 'email' | 'inApp')[]; // How to deliver the reminder
  createdAt: string; // ISO string
  sentAt?: string; // ISO string
}