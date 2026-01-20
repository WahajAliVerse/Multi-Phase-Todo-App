// types/index.ts

// Define TypeScript interfaces for our application

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  preferences?: {
    theme?: 'light' | 'dark';
    notificationSettings?: any;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string; // ISO string format
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  completedAt?: string; // ISO string format
  userId: string;
  recurrencePatternId?: string;
  tags?: string[]; // Array of tag IDs or tag objects
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string; // ISO string format
}

export interface RecurrencePattern {
  id: string;
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