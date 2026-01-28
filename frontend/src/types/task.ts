// types/task.ts
import { Tag } from './tag';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string; // ISO date string
  completed_at?: string; // ISO date string
  recurrence_pattern?: string;
  user_id: number;
  created_at: string; // ISO date string
  updated_at?: string; // ISO date string
  version: number;
  tags: Tag[];
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  recurrence_pattern?: string;
  tag_ids?: number[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  recurrence_pattern?: string;
  tag_ids?: number[];
}

export interface PaginatedTasks {
  tasks: Task[];
  total: number;
  skip: number;
  limit: number;
}