export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  priority: 'high' | 'medium' | 'low';
  due_date?: string; // ISO date string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  completed_at?: string; // ISO date string
  tags: Tag[];
  recurrence_pattern?: string; // daily, weekly, monthly
  version: number; // For optimistic locking
}

export interface Tag {
  id: string;
  name: string;
  color?: string; // hex color code
  created_at: string; // ISO date string
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string; // ISO date string
  theme_preference: 'light' | 'dark' | 'auto';
}