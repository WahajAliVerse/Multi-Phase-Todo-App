export interface RecurrencePattern {
  id: string;
  patternType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every N days/weeks/months/years
  endCondition: 'never' | 'after_occurrences' | 'on_date';
  occurrenceCount?: number; // for 'after_occurrences' end condition
  endDate?: string; // for 'on_date' end condition (ISO string)
  daysOfWeek?: Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>; // for weekly patterns
  daysOfMonth?: number[]; // for monthly patterns (1-31)
  monthOfYear?: number; // for yearly patterns (1-12)
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}