import { RecurrencePattern } from '@/models/recurrence';

/**
 * Service for validating recurrence patterns
 */
export class RecurrenceValidationService {
  /**
   * Validates a recurrence pattern
   * @param pattern The pattern to validate
   * @returns Validation result with errors if any
   */
  static validatePattern(pattern: RecurrencePattern): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate pattern type
    if (!pattern.patternType) {
      errors.push('Pattern type is required');
    } else if (!['daily', 'weekly', 'monthly', 'yearly'].includes(pattern.patternType)) {
      errors.push('Invalid pattern type');
    }

    // Validate interval
    if (!pattern.interval) {
      errors.push('Interval is required');
    } else if (pattern.interval <= 0) {
      errors.push('Interval must be a positive number');
    }

    // Validate end condition
    if (!pattern.endCondition) {
      errors.push('End condition is required');
    } else if (!['never', 'after_occurrences', 'on_date'].includes(pattern.endCondition)) {
      errors.push('Invalid end condition');
    }

    // Validate occurrence count if end condition is 'after_occurrences'
    if (pattern.endCondition === 'after_occurrences') {
      if (!pattern.occurrenceCount) {
        errors.push('Occurrence count is required when end condition is "after occurrences"');
      } else if (pattern.occurrenceCount <= 0) {
        errors.push('Occurrence count must be a positive number');
      }
    }

    // Validate end date if end condition is 'on_date'
    if (pattern.endCondition === 'on_date') {
      if (!pattern.endDate) {
        errors.push('End date is required when end condition is "on date"');
      } else {
        try {
          const date = new Date(pattern.endDate);
          if (isNaN(date.getTime())) {
            errors.push('End date is not valid');
          }
        } catch (e) {
          errors.push('End date is not valid');
        }
      }
    }

    // Validate days of week for weekly patterns
    if (pattern.patternType === 'weekly' && pattern.daysOfWeek) {
      const validDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      for (const day of pattern.daysOfWeek) {
        if (!validDays.includes(day)) {
          errors.push(`Invalid day of week: ${day}`);
        }
      }
    }

    // Validate days of month for monthly patterns
    if (pattern.patternType === 'monthly' && pattern.daysOfMonth) {
      for (const day of pattern.daysOfMonth) {
        if (day < 1 || day > 31) {
          errors.push(`Invalid day of month: ${day}. Must be between 1 and 31.`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Provides real-time validation feedback as the user fills out the form
   * @param formData The current form data
   * @returns Validation feedback
   */
  static getRealTimeFeedback(formData: Partial<RecurrencePattern>): { warnings: string[]; suggestions: string[] } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for potentially problematic configurations
    if (formData.patternType === 'daily' && formData.interval && formData.interval < 1) {
      warnings.push('Daily intervals less than 1 day are not valid');
    }

    if (formData.patternType === 'yearly' && formData.interval && formData.interval > 5) {
      warnings.push('Yearly intervals greater than 5 years might create sparse recurrences');
    }

    if (formData.patternType === 'weekly' && formData.daysOfWeek && formData.daysOfWeek.length > 5) {
      warnings.push('Setting many days of the week may create frequent recurrences');
    }

    if (formData.endCondition === 'after_occurrences' && formData.occurrenceCount && formData.occurrenceCount > 1000) {
      warnings.push('Creating more than 1000 occurrences may impact performance');
    }

    // Provide suggestions
    if (formData.patternType === 'monthly' && formData.daysOfMonth && formData.daysOfMonth.includes(31)) {
      suggestions.push('Note: Months with fewer than 31 days will skip this occurrence');
    }

    if (formData.patternType === 'monthly' && formData.daysOfMonth && formData.daysOfMonth.includes(29)) {
      suggestions.push('Note: February in non-leap years will skip this occurrence');
    }

    if (formData.endCondition === 'never') {
      suggestions.push('Consider setting an end condition to prevent infinite recurrences');
    }

    return {
      warnings,
      suggestions,
    };
  }

  /**
   * Checks if a recurrence pattern is valid for a given date range
   * @param pattern The pattern to check
   * @param startDate The start date for the pattern
   * @param endDate The end date for the pattern (optional)
   * @returns True if the pattern is valid for the date range
   */
  static isValidForDateRange(pattern: RecurrencePattern, startDate: Date, endDate?: Date): boolean {
    // If end date is provided, ensure it's after start date
    if (endDate && startDate > endDate) {
      return false;
    }

    // If end condition is 'on_date', ensure the pattern's end date is valid
    if (pattern.endCondition === 'on_date' && pattern.endDate) {
      const patternEndDate = new Date(pattern.endDate);
      if (startDate > patternEndDate) {
        return false;
      }
    }

    return true;
  }

  /**
   * Estimates the number of occurrences a pattern will generate
   * @param pattern The pattern to estimate
   * @param startDate The start date for the pattern
   * @param endDate The end date for the pattern (optional)
   * @returns Estimated number of occurrences
   */
  static estimateOccurrences(pattern: RecurrencePattern, startDate: Date, endDate?: Date): number {
    // If end condition is 'after_occurrences', return that value
    if (pattern.endCondition === 'after_occurrences' && pattern.occurrenceCount) {
      return pattern.occurrenceCount;
    }

    // If end condition is 'on_date', estimate based on time span
    if (pattern.endCondition === 'on_date' && pattern.endDate) {
      endDate = new Date(pattern.endDate);
    }

    // If no end condition, return a large number to indicate indefinite
    if (!endDate || pattern.endCondition === 'never') {
      return Infinity;
    }

    // Calculate based on pattern type and interval
    const timeDiff = endDate.getTime() - startDate.getTime();
    let intervalMs: number;

    switch (pattern.patternType) {
      case 'daily':
        intervalMs = pattern.interval * 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        intervalMs = pattern.interval * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        // Approximate month as 30 days
        intervalMs = pattern.interval * 30 * 24 * 60 * 60 * 1000;
        break;
      case 'yearly':
        // Approximate year as 365 days
        intervalMs = pattern.interval * 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        return 0;
    }

    return Math.floor(timeDiff / intervalMs) + 1;
  }
}