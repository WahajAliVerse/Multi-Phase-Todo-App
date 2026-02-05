import { RecurrencePattern } from '../models/recurrence';

export class RecurrenceService {
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
   * Checks if a recurrence pattern would conflict with existing tasks
   * @param pattern The recurrence pattern to check
   * @param existingTaskDates Dates of existing tasks to check against
   * @returns True if there's a conflict, false otherwise
   */
  static checkForConflicts(
    pattern: RecurrencePattern,
    existingTaskDates: Date[],
    startDate: Date,
    endDate?: Date
  ): boolean {
    const futureInstances = this.generateFutureInstances(pattern, startDate, endDate);
    
    return futureInstances.some(instance => 
      existingTaskDates.some(existingDate => 
        this.isSameDay(instance, existingDate)
      )
    );
  }

  /**
   * Checks if two dates are on the same day
   */
  private static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}