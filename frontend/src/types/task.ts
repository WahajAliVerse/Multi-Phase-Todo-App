// types/task.ts

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string; // ISO string format
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  completedAt?: string; // ISO string format
  userId: number;
  recurrencePatternId?: number;
  tags?: string[]; // Array of tag IDs or tag objects
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  userId: number;
  createdAt: string; // ISO string format
}

export interface RecurrencePattern {
  id: number;
  patternType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endCondition: 'never' | 'after_occurrences' | 'on_date';
  occurrenceCount?: number; // For 'after_occurrences' condition
  endDate?: string; // For 'on_date' condition (ISO date string)
  daysOfWeek?: string; // For weekly patterns (e.g., 'mon,tue,fri')
  daysOfMonth?: string; // For monthly patterns (e.g., '1,15')
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}