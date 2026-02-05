import { useEffect } from 'react';

/**
 * Accessibility utilities for the todo application
 */

/**
 * Custom hook to manage focus trap for modal dialogs and other focus-controlling components
 * @param ref - The ref of the element to trap focus within
 * @param isActive - Whether the focus trap is active
 */
export const useFocusTrap = (ref: React.RefObject<HTMLElement>, isActive: boolean) => {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    // Focus the first element when the trap activates
    firstElement?.focus();

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, isActive]);
};

/**
 * Custom hook to manage keyboard navigation for lists and grids
 * @param containerRef - The ref of the container element
 * @param itemSelector - CSS selector for focusable items
 * @param orientation - 'vertical' or 'horizontal'
 */
export const useKeyboardNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  itemSelector: string,
  orientation: 'vertical' | 'horizontal' = 'vertical'
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        return;
      }

      const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
      if (items.length === 0) return;

      const currentIndex = items.findIndex(item => item === document.activeElement);

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowUp':
          if (orientation === 'vertical') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical') {
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal') {
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          }
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        e.preventDefault();
        items[nextIndex]?.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, itemSelector, orientation]);
};

/**
 * Utility function to generate ARIA-compliant labels
 */
export class AriaLabelGenerator {
  /**
   * Generates a label for a task item
   * @param title - The task title
   * @param status - The task status
   * @param priority - The task priority
   * @param dueDate - The task due date (optional)
   * @returns ARIA label string
   */
  static generateTaskLabel(
    title: string,
    status: 'active' | 'completed',
    priority: 'low' | 'medium' | 'high',
    dueDate?: string
  ): string {
    const statusText = status === 'completed' ? 'completed' : 'to do';
    const priorityText = priority === 'high' ? 'high priority' : priority === 'medium' ? 'medium priority' : 'low priority';
    const dueDateText = dueDate ? `, due ${new Date(dueDate).toLocaleDateString()}` : '';

    return `${title}, ${statusText}, ${priorityText}${dueDateText}`;
  }

  /**
   * Generates a label for a tag
   * @param name - The tag name
   * @param color - The tag color
   * @returns ARIA label string
   */
  static generateTagLabel(name: string, color: string): string {
    return `${name} tag, color ${color}`;
  }

  /**
   * Generates a label for a recurrence pattern
   * @param patternType - The pattern type (daily, weekly, etc.)
   * @param interval - The interval
   * @param endCondition - The end condition
   * @returns ARIA label string
   */
  static generateRecurrenceLabel(
    patternType: string,
    interval: number,
    endCondition: string
  ): string {
    const intervalText = interval > 1 ? `${interval} ${patternType}s` : `${patternType}`;
    const endText = endCondition === 'never' 
      ? 'repeating indefinitely' 
      : endCondition === 'after_occurrences' 
        ? `ending after occurrences` 
        : 'ending on date';

    return `Repeats every ${intervalText}, ${endText}`;
  }

  /**
   * Generates a label for a reminder
   * @param scheduledTime - The scheduled time
   * @param deliveryMethods - The delivery methods
   * @returns ARIA label string
   */
  static generateReminderLabel(
    scheduledTime: string,
    deliveryMethods: string[]
  ): string {
    const time = new Date(scheduledTime).toLocaleString();
    const methods = deliveryMethods.join(', ');

    return `Reminder scheduled for ${time}, delivered via ${methods}`;
  }
}

/**
 * Utility function to manage screen reader announcements
 */
export class ScreenReaderAnnouncer {
  private static announcementContainer: HTMLDivElement | null = null;

  /**
   * Initializes the announcement container
   */
  static initialize() {
    if (this.announcementContainer) return;

    this.announcementContainer = document.createElement('div');
    this.announcementContainer.setAttribute('aria-live', 'polite');
    this.announcementContainer.setAttribute('aria-atomic', 'true');
    this.announcementContainer.className = 'sr-only';
    this.announcementContainer.style.position = 'absolute';
    this.announcementContainer.style.left = '-10000px';
    this.announcementContainer.style.top = 'auto';
    this.announcementContainer.style.width = '1px';
    this.announcementContainer.style.height = '1px';
    this.announcementContainer.style.overflow = 'hidden';

    document.body.appendChild(this.announcementContainer);
  }

  /**
   * Announces a message to screen readers
   * @param message - The message to announce
   */
  static announce(message: string) {
    if (!this.announcementContainer) {
      this.initialize();
    }

    // Clear previous announcement
    if (this.announcementContainer) {
      this.announcementContainer.textContent = '';
      
      // Trigger reflow to ensure the screen reader picks up the change
      this.announcementContainer.textContent = message;
    }
  }
}

/**
 * Utility function to manage skip links for keyboard navigation
 */
export class SkipLinkManager {
  /**
   * Creates a skip link to a target element
   * @param targetId - The ID of the target element
   * @param text - The text for the skip link
   * @returns The skip link element
   */
  static createSkipLink(targetId: string, text: string = 'Skip to content'): HTMLAnchorElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow focus:text-gray-900 focus:no-underline';
    
    return skipLink;
  }

  /**
   * Adds a skip link to the document
   * @param targetId - The ID of the target element
   * @param text - The text for the skip link
   */
  static addSkipLink(targetId: string, text: string = 'Skip to content') {
    const skipLink = this.createSkipLink(targetId, text);
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}