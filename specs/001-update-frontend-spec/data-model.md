# Data Model Design: Frontend Updates for Recurrence, Reminders, and Tags

## 1. Task Entity Extension
The existing Task entity will be extended with new properties for the additional features:

```typescript
interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  userId: number;

  // New properties for enhanced functionality
  tags: Tag[];
  recurrencePattern?: RecurrencePattern;
  reminders?: Reminder[];
}
```

## 2. Tag Entity
```typescript
interface Tag {
  id: number;
  name: string;
  color: string; // From predefined accessible palette
  userId: number;
  createdAt: Date;
  updatedAt?: Date;
}
```

## 3. RecurrencePattern Entity
```typescript
interface RecurrencePattern {
  id: number;
  patternType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // How often the pattern repeats (every N days/weeks/etc)
  endCondition: 'never' | 'after_occurrences' | 'on_date';
  occurrenceCount?: number; // For 'after_occurrences' condition
  endDate?: Date; // For 'on_date' condition
  daysOfWeek?: string[]; // For weekly patterns (e.g., ['mon', 'tue', 'fri'])
  daysOfMonth?: number[]; // For monthly patterns (e.g., [1, 15])
  createdAt: Date;
  updatedAt?: Date;
}
```

## 4. Reminder Entity
```typescript
interface Reminder {
  id: number;
  taskId: number;
  scheduledTime: Date; // Stored in UTC
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: Date;
  sentAt?: Date;
}
```

## 5. Validation Rules
- Tag names must be unique per user account
- Recurrence patterns must have valid combinations of frequency, interval, and end conditions
- Reminder times must be in the future
- Task due dates must be valid dates

## 6. Relationships
- A Task can have multiple Tags (many-to-many relationship through task_tags junction)
- A Task can have zero or one RecurrencePattern (one-to-one relationship)
- A Task can have multiple Reminders (one-to-many relationship)
- A User can have many Tags, RecurrencePatterns, and Reminders