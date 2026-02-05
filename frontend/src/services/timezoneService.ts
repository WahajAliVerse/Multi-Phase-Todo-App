import { format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Utility functions for handling timezone conversions
 */
export class TimezoneService {
  /**
   * Converts a date from the user's local timezone to UTC
   * @param date The date to convert
   * @param userTimezone The user's timezone (e.g., 'America/New_York')
   * @returns The date in UTC
   */
  static convertToUTC(date: Date, userTimezone: string): Date {
    return fromZonedTime(date, userTimezone);
  }

  /**
   * Converts a date from UTC to the user's local timezone
   * @param utcDate The UTC date to convert
   * @param userTimezone The user's timezone (e.g., 'America/New_York')
   * @returns The date in the user's local timezone
   */
  static convertToLocal(utcDate: Date, userTimezone: string): Date {
    return toZonedTime(utcDate, userTimezone);
  }

  /**
   * Gets the user's current timezone
   * @returns The user's timezone string (e.g., 'America/New_York')
   */
  static getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Formats a date for display in the user's timezone
   * @param date The date to format
   * @param userTimezone The user's timezone
   * @param formatStr The format string (default: 'yyyy-MM-dd HH:mm:ss XXX')
   * @returns The formatted date string
   */
  static formatDateForDisplay(date: Date, userTimezone: string, formatStr: string = 'yyyy-MM-dd HH:mm:ss XXX'): string {
    const localDate = this.convertToLocal(date, userTimezone);
    return format(localDate, formatStr);
  }

  /**
   * Formats a date for storage in UTC
   * @param date The date to format
   * @param userTimezone The user's timezone
   * @param formatStr The format string (default: 'yyyy-MM-dd HH:mm:ss XXX')
   * @returns The formatted date string in UTC
   */
  static formatDateForStorage(date: Date, userTimezone: string, formatStr: string = 'yyyy-MM-dd HH:mm:ss XXX'): string {
    const utcDate = this.convertToUTC(date, userTimezone);
    return format(utcDate, formatStr);
  }

  /**
   * Creates a date from a string in the user's timezone
   * @param dateString The date string to parse
   * @param userTimezone The user's timezone
   * @returns The parsed date in the user's timezone
   */
  static createDateFromLocal(dateString: string, userTimezone: string): Date {
    // Create a date in the user's timezone
    const date = new Date(dateString);
    return this.convertToUTC(date, userTimezone);
  }

  /**
   * Validates if a timezone is valid
   * @param timezone The timezone to validate
   * @returns True if the timezone is valid, false otherwise
   */
  static isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets a list of common timezones
   * @returns Array of common timezone strings
   */
  static getCommonTimezones(): string[] {
    return [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Pacific/Auckland'
    ];
  }

  /**
   * Calculates the time difference between two timezones
   * @param timezone1 First timezone
   * @param timezone2 Second timezone
   * @param atDate Date to calculate the difference at (default: now)
   * @returns The time difference in hours
   */
  static getTimeDifference(timezone1: string, timezone2: string, atDate: Date = new Date()): number {
    const date1 = new Date(atDate.toLocaleString('en-US', { timeZone: timezone1 }));
    const date2 = new Date(atDate.toLocaleString('en-US', { timeZone: timezone2 }));

    return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
  }
}