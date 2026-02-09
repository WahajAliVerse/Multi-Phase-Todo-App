/**
 * Safely parses a date string and returns a Date object
 * @param dateString - The date string to parse
 * @returns A Date object or null if the string cannot be parsed
 */
export function safeParseDate(dateString: string | undefined | null): Date | null {
  if (!dateString) {
    return null;
  }

  // Check if it's already an ISO string
  if (typeof dateString === 'string') {
    // Try to parse the date string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string provided: ${dateString}`);
      return null;
    }
    
    return date;
  }
  
  return null;
}

/**
 * Converts a date string to a localized date string
 * @param dateString - The date string to convert
 * @param options - Optional formatting options
 * @returns A formatted date string or empty string if invalid
 */
export function formatDate(dateString: string | undefined | null, options?: Intl.DateTimeFormatOptions): string {
  const date = safeParseDate(dateString);
  
  if (!date) {
    return '';
  }

  const formatOptions: Intl.DateTimeFormatOptions = options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  return date.toLocaleDateString(undefined, formatOptions);
}

/**
 * Checks if a date string is valid
 * @param dateString - The date string to validate
 * @returns True if the date is valid, false otherwise
 */
export function isValidDate(dateString: string | undefined | null): boolean {
  return safeParseDate(dateString) !== null;
}