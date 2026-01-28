// Implementation of focus management for modal dialogs and dropdowns
import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

// Hook to manage focus within modal dialogs
export const useModalFocus = (isOpen: boolean, modalRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element when the modal opens
    if (firstElement) {
      firstElement.focus();
    }

    // Function to handle Tab key for focus trapping
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    // Add event listener to trap focus
    document.addEventListener('keydown', handleTabKey);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, modalRef]);
};

// Hook to manage focus within dropdowns
export const useDropdownFocus = (isOpen: boolean, dropdownRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const dropdown = dropdownRef.current;
    const focusableElements = dropdown.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    // Focus the first element when the dropdown opens
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    // Function to handle keyboard navigation within dropdown
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape', 'Enter'].includes(event.key)) {
        return;
      }

      const currentElement = document.activeElement as HTMLElement;
      const currentIndex = Array.prototype.indexOf.call(focusableElements, currentElement);

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % focusableElements.length;
          break;
        case 'ArrowUp':
          nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = focusableElements.length - 1;
          break;
        case 'Escape':
          // Close the dropdown when Escape is pressed
          dropdown.blur();
          return;
        case 'Enter':
          // Trigger click on the focused element
          currentElement.click();
          return;
      }

      event.preventDefault();
      (focusableElements[nextIndex] as HTMLElement).focus();
    };

    // Add event listener for keyboard navigation
    dropdown.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      dropdown.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, dropdownRef]);
};

// Hook to manage focus for general components
export const useFocusManagement = () => {
  const containerRef = useRef<HTMLElement>(null);

  // Function to focus the first focusable element in the container
  const focusFirstElement = () => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  };

  // Function to focus the last focusable element in the container
  const focusLastElement = () => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  };

  // Function to focus a specific element by selector
  const focusElement = (selector: string) => {
    if (!containerRef.current) return;

    const element = containerRef.current.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  };

  return {
    containerRef,
    focusFirstElement,
    focusLastElement,
    focusElement,
  };
};

// Utility function to ensure focus stays within a specific container
export const trapFocusWithin = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

// Component wrapper to automatically manage focus
type FocusTrapProps = {
  children: ReactNode;
  active?: boolean;
};

export const FocusTrap: React.FC<FocusTrapProps> = ({ children, active = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    return trapFocusWithin(containerRef.current);
  }, [active]);

  return React.createElement('div', { ref: containerRef }, children);
};