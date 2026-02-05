import { z } from 'zod';

// Define Zod schemas for validation
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  status: z.enum(['active', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
});

export const recurrencePatternSchema = z.object({
  patternType: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().positive('Interval must be a positive number'),
  endCondition: z.enum(['never', 'after_occurrences', 'on_date']),
  occurrenceCount: z.number().positive().optional(),
  endDate: z.string().datetime().optional(),
  daysOfWeek: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
  daysOfMonth: z.array(z.number().min(1).max(31)).optional(),
});

export const reminderSchema = z.object({
  taskId: z.string(),
  scheduledTime: z.string().datetime(),
  deliveryMethods: z.array(z.enum(['browser', 'email', 'inApp'])).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
export type TagFormData = z.infer<typeof tagSchema>;
export type RecurrencePatternFormData = z.infer<typeof recurrencePatternSchema>;
export type ReminderFormData = z.infer<typeof reminderSchema>;