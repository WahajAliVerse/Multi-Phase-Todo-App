// Input validation utilities for the Todo Application

import { z } from 'zod';

// User validation schemas
export const userValidationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  theme_preference: z.enum(['light', 'dark'], { 
    errorMap: () => ({ message: 'Theme must be either light or dark' }) 
  }),
  notification_settings: z.object({
    email: z.boolean(),
    browser: z.boolean(),
  }),
});

// Task validation schemas
export const taskValidationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed'], {
    errorMap: () => ({ message: 'Status must be pending, in_progress, or completed' })
  }).default('pending'),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium, or high' })
  }).default('medium'),
  due_date: z.string().datetime().optional().nullable(),
  tag_ids: z.array(z.string()).optional(),
  recurrence_pattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().int().positive(),
    days_of_week: z.array(z.string()).optional(),
    day_of_month: z.number().int().min(1).max(31).optional(),
    end_condition: z.enum(['never', 'after', 'on_date']),
    end_after_occurrences: z.number().int().positive().optional(),
    end_date: z.string().datetime().optional(),
  }).optional().nullable(),
});

// Tag validation schemas
export const tagValidationSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex code').optional(),
});

// Recurrence pattern validation
export const recurrenceValidationSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    errorMap: () => ({ message: 'Frequency must be daily, weekly, monthly, or yearly' })
  }),
  interval: z.number().int().positive('Interval must be a positive number').min(1).max(365),
  days_of_week: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
  day_of_month: z.number().int().min(1).max(31).optional(),
  end_condition: z.enum(['never', 'after', 'on_date'], {
    errorMap: () => ({ message: 'End condition must be never, after, or on_date' })
  }),
  end_after_occurrences: z.number().int().positive().optional(),
  end_date: z.string().datetime().optional(),
});

// Notification validation schema
export const notificationValidationSchema = z.object({
  type: z.enum(['email', 'browser', 'push'], {
    errorMap: () => ({ message: 'Notification type must be email, browser, or push' })
  }),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  task_id: z.string().optional(),
});

// Validation utility functions
export const validateUserInput = (input: any) => {
  try {
    const validatedUser = userValidationSchema.parse(input);
    return { success: true, data: validatedUser, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        data: null, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }
    return { success: false, data: null, error: 'Unknown validation error' };
  }
};

export const validateTaskInput = (input: any) => {
  try {
    const validatedTask = taskValidationSchema.parse(input);
    return { success: true, data: validatedTask, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        data: null, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }
    return { success: false, data: null, error: 'Unknown validation error' };
  }
};

export const validateTagInput = (input: any) => {
  try {
    const validatedTag = tagValidationSchema.parse(input);
    return { success: true, data: validatedTag, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        data: null, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }
    return { success: false, data: null, error: 'Unknown validation error' };
  }
};

export const validateRecurrenceInput = (input: any) => {
  try {
    const validatedRecurrence = recurrenceValidationSchema.parse(input);
    return { success: true, data: validatedRecurrence, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        data: null, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }
    return { success: false, data: null, error: 'Unknown validation error' };
  }
};

export const validateNotificationInput = (input: any) => {
  try {
    const validatedNotification = notificationValidationSchema.parse(input);
    return { success: true, data: validatedNotification, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        data: null, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }
    return { success: false, data: null, error: 'Unknown validation error' };
  }
};

// Custom validation functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidHexColor = (color: string): boolean => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// Sanitization utilities
export const sanitizeString = (str: string): string => {
  // Remove potentially dangerous characters
  return str.replace(/[<>]/g, '');
};

export const sanitizeHtml = (html: string): string => {
  // In a real application, use a proper HTML sanitizer like DOMPurify
  // For now, just remove script tags
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Validation middleware for FastAPI
export const validateWithZod = (schema: z.ZodSchema) => {
  return (data: any) => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error('Unknown validation error');
    }
  };
};