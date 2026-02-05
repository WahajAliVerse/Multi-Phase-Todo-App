import { RecurrencePattern } from '@/models/recurrence';
import { Task } from '@/models/task';

/**
 * Service for detecting conflicts between recurrence patterns
 */
export class RecurrenceConflictService {
  /**
   * Checks if a new recurrence pattern would conflict with existing tasks
   * @param newPattern The new recurrence pattern to check
   * @param existingTasks The existing tasks to check against
   * @param startDate The start date for the new pattern
   * @param endDate The end date for the new pattern (optional)
   * @param maxInstances Max number of instances to generate for comparison (default: 100)
   * @returns Array of conflicting task instances
   */
  static checkForConflicts(
    newPattern: RecurrencePattern,
    existingTasks: Task[],
    startDate: Date,
    endDate?: Date,
    maxInstances: number = 100
  ): Task[] {
    // Generate future instances based on the new pattern
    const futureInstances = this.generateFutureInstances(newPattern, startDate, endDate, maxInstances);
    
    // Convert future instances to dates for comparison
    const futureInstanceDates = futureInstances.map(date => 
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    );
    
    // Find existing tasks that have due dates matching the future instances
    const conflictingTasks: Task[] = [];
    
    for (const task of existingTasks) {
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate);
        const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()).getTime();
        
        // Check if this task's due date matches any of the future instances
        if (futureInstanceDates.includes(taskDateOnly)) {
          conflictingTasks.push(task);
        }
      }
    }
    
    return conflictingTasks;
  }

  /**
   * Generates future task instances based on a recurrence pattern
   * @param pattern The recurrence pattern to use
   * @param startDate The start date to begin generating instances from
   * @param endDate The end date to stop generating instances (optional)
   * @param maxInstances Maximum number of instances to generate (default: 100)
   * @returns Array of dates representing future task instances
   */
  static generateFutureInstances(
    pattern: RecurrencePattern,
    startDate: Date,
    endDate?: Date,
    maxInstances: number = 100
  ): Date[] {
    const instances: Date[] = [];
    let currentDate = new Date(startDate);
    
    // Adjust to the next occurrence based on the pattern
    currentDate = this.getNextOccurrence(pattern, currentDate);
    
    while (
      (!endDate || currentDate <= endDate) &&
      instances.length < maxInstances
    ) {
      instances.push(new Date(currentDate));
      
      // Calculate next occurrence based on pattern
      currentDate = this.getNextOccurrence(pattern, currentDate, true);
      
      // Check end conditions
      if (pattern.endCondition === 'after_occurrences' && instances.length >= (pattern.occurrenceCount || 0)) {
        break;
      }
    }
    
    return instances;
  }

  /**
   * Calculates the next occurrence based on the recurrence pattern
   * @param pattern The recurrence pattern
   * @param fromDate The date to calculate from
   * @param isIncrement Whether this is an increment from a previous occurrence
   * @returns The next occurrence date
   */
  private static getNextOccurrence(
    pattern: RecurrencePattern,
    fromDate: Date,
    isIncrement: boolean = false
  ): Date {
    const nextDate = new Date(fromDate);
    
    switch (pattern.patternType) {
      case 'daily':
        if (isIncrement) {
          nextDate.setDate(nextDate.getDate() + pattern.interval);
        }
        break;
        
      case 'weekly':
        if (isIncrement) {
          // Move to next week
          nextDate.setDate(nextDate.getDate() + 7 * pattern.interval);
          
          // If days of week are specified, find the next valid day
          if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
            return this.findNextValidDay(nextDate, pattern.daysOfWeek);
          }
        } else {
          // If days of week are specified, find the next valid day from fromDate
          if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
            return this.findNextValidDay(nextDate, pattern.daysOfWeek);
          }
        }
        break;
        
      case 'monthly':
        if (isIncrement) {
          // Add months based on interval
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
          
          // If specific days of month are specified, adjust to the next valid day
          if (pattern.daysOfMonth && pattern.daysOfMonth.length > 0) {
            return this.findNextValidDayOfMonth(nextDate, pattern.daysOfMonth);
          }
        } else {
          // If specific days of month are specified, adjust to the next valid day from fromDate
          if (pattern.daysOfMonth && pattern.daysOfMonth.length > 0) {
            return this.findNextValidDayOfMonth(nextDate, pattern.daysOfMonth);
          }
        }
        break;
        
      case 'yearly':
        if (isIncrement) {
          // Add years based on interval
          nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        }
        break;
    }
    
    return nextDate;
  }

  /**
   * Finds the next valid day of the week from the specified date
   */
  private static findNextValidDay(fromDate: Date, validDays: Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>): Date {
    const dayMap: { [key: string]: number } = {
      'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
    };
    
    const validDayNumbers = validDays.map(day => dayMap[day]);
    const fromDateDay = fromDate.getDay();
    
    // If the current day is a valid day and we're looking for the next occurrence, 
    // we need to find the next valid day
    if (validDayNumbers.includes(fromDateDay)) {
      // This is already a valid day, so return it
      return new Date(fromDate);
    }
    
    // Find the next valid day
    for (let i = 1; i <= 7; i++) {
      const nextDay = (fromDateDay + i) % 7;
      if (validDayNumbers.includes(nextDay)) {
        const nextDate = new Date(fromDate);
        nextDate.setDate(nextDate.getDate() + i);
        return nextDate;
      }
    }
    
    // Fallback (should not happen if validDays is not empty)
    return new Date(fromDate);
  }

  /**
   * Finds the next valid day of the month from the specified date
   */
  private static findNextValidDayOfMonth(fromDate: Date, validDays: number[]): Date {
    const currentDay = fromDate.getDate();
    
    // Find the next valid day in the current month
    for (const day of validDays) {
      if (day >= currentDay) {
        const nextDate = new Date(fromDate);
        nextDate.setDate(day);
        return nextDate;
      }
    }
    
    // If no valid day remains in the current month, 
    // find the first valid day in the next month
    const nextDate = new Date(fromDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    nextDate.setDate(Math.min(...validDays)); // Use the first valid day of the month
    
    return nextDate;
  }

  /**
   * Checks if two dates are on the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}