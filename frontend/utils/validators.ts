import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  email: z.string().email('Must be a valid email'),
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters').optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).optional(),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const loginSchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters').optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters').optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
  }).optional(),
});

// Task validation schemas
export const taskSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  completed: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  userId: z.string().min(1, 'User ID is required'),
  recurrence: z.object({
    pattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().positive('Interval must be a positive number'),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createTaskSchema = taskSchema.omit({
  id: true,
  completed: true,
  userId: true,
  createdAt: true,
  updatedAt: true
}).partial({ priority: true });

export const updateTaskSchema = taskSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
}).partial();

// Tag validation schemas
export const tagSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').max(30, 'Name must be less than 30 characters'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code'),
  userId: z.string().min(1, 'User ID is required'),
  taskCount: z.number().optional(), // Number of tasks associated with this tag
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createTagSchema = tagSchema.omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
}).partial({ color: true });

export const updateTagSchema = createTagSchema.partial();

// Export types
export type User = z.infer<typeof userSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskData = z.infer<typeof createTaskSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;

export type Tag = z.infer<typeof tagSchema>;
export type CreateTagData = z.infer<typeof createTagSchema>;
export type UpdateTagData = z.infer<typeof updateTagSchema>;