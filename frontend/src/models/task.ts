import { Tag } from './tag';
import { RecurrencePattern } from './recurrence';
import { Reminder } from './reminder';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  completedAt?: string; // ISO string
  userId: string; // owner identifier
  tags?: Tag[]; // associated tags
  recurrencePattern?: RecurrencePattern; // repetition configuration
  reminders?: Reminder[]; // notification settings
}