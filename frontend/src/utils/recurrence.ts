import { Task, RecurrencePattern } from '@/lib/types';

// Function to check if a recurrence pattern conflicts with existing tasks
export const checkRecurrenceConflicts = (
  newPattern: RecurrencePattern,
  existingTasks: Task[],
  userId: number
): Task[] => {
  // Filter tasks belonging to the same user
  const userTasks = existingTasks.filter(task => task.userId === userId);
  
  // Find tasks that have recurrence patterns
  const recurringTasks = userTasks.filter(task => task.recurrencePattern);
  
  // Check for potential conflicts based on recurrence patterns
  const conflictingTasks: Task[] = [];
  
  for (const task of recurringTasks) {
    if (!task.recurrencePattern) continue;
    
    // Check if the new pattern would create overlapping instances
    // This is a simplified check - in a real app, you'd need to calculate
    // the actual recurrence instances and compare them
    if (patternsMayConflict(newPattern, task.recurrencePattern)) {
      conflictingTasks.push(task);
    }
  }
  
  return conflictingTasks;
};

// Helper function to determine if two patterns may conflict
const patternsMayConflict = (
  pattern1: RecurrencePattern,
  pattern2: RecurrencePattern
): boolean => {
  // Same pattern type and interval might conflict
  if (pattern1.patternType === pattern2.patternType && pattern1.interval === pattern2.interval) {
    // Check if they have overlapping days (for weekly/monthly patterns)
    if (pattern1.patternType === 'weekly' && pattern2.patternType === 'weekly') {
      // Check if they share common days of the week
      if (pattern1.daysOfWeek && pattern2.daysOfWeek) {
        const commonDays = pattern1.daysOfWeek.filter(day => 
          pattern2.daysOfWeek?.includes(day)
        );
        return commonDays.length > 0;
      }
    } else if (pattern1.patternType === 'monthly' && pattern2.patternType === 'monthly') {
      // Check if they share common days of the month
      if (pattern1.daysOfMonth && pattern2.daysOfMonth) {
        const commonDays = pattern1.daysOfMonth.filter(day => 
          pattern2.daysOfMonth?.includes(day)
        );
        return commonDays.length > 0;
      }
    }
    
    // If same frequency and interval, consider it a potential conflict
    return true;
  }
  
  // Different pattern types might still conflict if they both occur daily
  if ((pattern1.patternType === 'daily' && pattern2.patternType === 'daily')) {
    return true;
  }
  
  // For yearly patterns with same interval, check if they occur on same day of year
  if (pattern1.patternType === 'yearly' && pattern2.patternType === 'yearly' && 
      pattern1.interval === pattern2.interval) {
    // This would require more complex date calculations
    return true;
  }
  
  return false;
};

// Function to calculate recurrence instances within a date range
export const calculateRecurrenceInstances = (
  pattern: RecurrencePattern,
  startDate: Date,
  endDate: Date
): Date[] => {
  const instances: Date[] = [];
  let currentDate = new Date(startDate);
  
  // Make sure start date is not before the pattern's start date
  if (pattern.createdAt && currentDate < new Date(pattern.createdAt)) {
    currentDate = new Date(pattern.createdAt);
  }
  
  // Calculate instances based on pattern type
  while (currentDate <= endDate) {
    // Check if this date matches the recurrence pattern
    if (matchesRecurrencePattern(currentDate, pattern)) {
      instances.push(new Date(currentDate));
      
      // Check end conditions
      if (pattern.endCondition === 'after_occurrences' && instances.length >= (pattern.occurrenceCount || 0)) {
        break;
      }
      
      if (pattern.endCondition === 'on_date' && pattern.endDate && currentDate >= new Date(pattern.endDate)) {
        break;
      }
    }
    
    // Move to next potential occurrence based on pattern type and interval
    switch (pattern.patternType) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + pattern.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (pattern.interval * 7));
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + pattern.interval);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + pattern.interval);
        break;
    }
  }
  
  return instances;
};

// Helper function to check if a date matches a recurrence pattern
const matchesRecurrencePattern = (date: Date, pattern: RecurrencePattern): boolean => {
  switch (pattern.patternType) {
    case 'daily':
      // Daily patterns match every occurrence based on interval
      return true;
      
    case 'weekly':
      // Check if the day of week matches the specified days
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const dayMap: Record<string, number> = {
          'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
        };
        
        const dayIndex = date.getDay();
        const dayAbbr = Object.keys(dayMap).find(key => dayMap[key] === dayIndex);
        
        return dayAbbr ? pattern.daysOfWeek.includes(dayAbbr) : false;
      }
      return true; // If no specific days specified, match all
      
    case 'monthly':
      // Check if the day of month matches the specified days
      if (pattern.daysOfMonth && pattern.daysOfMonth.length > 0) {
        const dayOfMonth = date.getDate();
        return pattern.daysOfMonth.includes(dayOfMonth);
      }
      return true; // If no specific days specified, match all
      
    case 'yearly':
      // For yearly, we typically just check the interval
      return true;
  }
};

// Function to validate a recurrence pattern
export const validateRecurrencePattern = (pattern: RecurrencePattern): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate pattern type
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(pattern.patternType)) {
    errors.push('Invalid pattern type');
  }
  
  // Validate interval
  if (!pattern.interval || pattern.interval <= 0) {
    errors.push('Interval must be a positive number');
  }
  
  // Validate end condition
  if (!['never', 'after_occurrences', 'on_date'].includes(pattern.endCondition)) {
    errors.push('Invalid end condition');
  }
  
  // Validate occurrence count if end condition is 'after_occurrences'
  if (pattern.endCondition === 'after_occurrences') {
    if (!pattern.occurrenceCount || pattern.occurrenceCount <= 0) {
      errors.push('Occurrence count must be a positive number when end condition is "after_occurrences"');
    }
  }
  
  // Validate end date if end condition is 'on_date'
  if (pattern.endCondition === 'on_date') {
    if (!pattern.endDate) {
      errors.push('End date is required when end condition is "on_date"');
    } else if (new Date(pattern.endDate) < new Date()) {
      errors.push('End date cannot be in the past');
    }
  }
  
  // Validate days of week for weekly patterns
  if (pattern.patternType === 'weekly' && pattern.daysOfWeek) {
    const validDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const invalidDays = pattern.daysOfWeek.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      errors.push(`Invalid days of week: ${invalidDays.join(', ')}`);
    }
  }
  
  // Validate days of month for monthly patterns
  if (pattern.patternType === 'monthly' && pattern.daysOfMonth) {
    const invalidDays = pattern.daysOfMonth.filter(day => day < 1 || day > 31);
    if (invalidDays.length > 0) {
      errors.push(`Invalid days of month: ${invalidDays.join(', ')}. Days must be between 1 and 31.`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Function to check if a recurrence pattern is active on a given date
export const isRecurrenceActiveOnDate = (pattern: RecurrencePattern, date: Date): boolean => {
  // Check if the date is before the pattern started
  if (pattern.createdAt && date < new Date(pattern.createdAt)) {
    return false;
  }
  
  // Check if the date is after the pattern ended
  if (pattern.endCondition === 'on_date' && pattern.endDate && date > new Date(pattern.endDate)) {
    return false;
  }
  
  // Check if the date matches the pattern
  return matchesRecurrencePattern(date, pattern);
};

// Function to get the next occurrence of a recurrence pattern
export const getNextRecurrenceDate = (pattern: RecurrencePattern, from: Date = new Date()): Date | null => {
  // Check if the pattern has already ended
  if (pattern.endCondition === 'on_date' && pattern.endDate && from > new Date(pattern.endDate)) {
    return null;
  }
  
  // Calculate the next occurrence
  let nextDate = new Date(from);
  
  // Advance the date until we find a matching occurrence
  for (let i = 0; i < 365; i++) { // Limit search to 1 year to prevent infinite loops
    if (matchesRecurrencePattern(nextDate, pattern)) {
      // Check if this occurrence is within the pattern's validity period
      if (pattern.endCondition === 'on_date' && pattern.endDate && nextDate > new Date(pattern.endDate)) {
        return null;
      }
      
      return nextDate;
    }
    
    // Move to next day
    nextDate.setDate(nextDate.getDate() + 1);
  }
  
  // If we couldn't find an occurrence within the search period, return null
  return null;
};