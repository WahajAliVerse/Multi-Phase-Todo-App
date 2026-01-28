// Implementation of keyboard navigation support for all interactive elements
import { useEffect } from 'react';

// Function to initialize keyboard navigation for all interactive elements
export const initializeKeyboardNavigation = () => {
  useEffect(() => {
    // Ensure all interactive elements have proper tab index
    const interactiveElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]'
    );
    
    interactiveElements.forEach((element, index) => {
      // Ensure elements are focusable
      if (!(element as HTMLElement).hasAttribute('tabindex')) {
        (element as HTMLElement).tabIndex = 0;
      }
    });
    
    // Add keyboard event listeners for common navigation patterns
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key for closing modals, dropdowns, etc.
      if (event.key === 'Escape') {
        closeOpenDialogs();
      }
      
      // Handle Enter and Space for activation
      if ((event.key === 'Enter' || event.key === ' ') && event.target) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
          event.preventDefault();
          target.click();
        }
      }
      
      // Handle arrow keys for navigation in menus, lists, etc.
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        handleArrowKeys(event);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

// Function to close open dialogs/modals when Escape is pressed
const closeOpenDialogs = () => {
  const openDialogs = document.querySelectorAll('[role="dialog"][open], [aria-modal="true"]');
  openDialogs.forEach(dialog => {
    (dialog as HTMLElement).hidden = true;
  });
};

// Function to handle arrow key navigation
const handleArrowKeys = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;
  const parentContainer = target.closest('[role="menu"], [role="listbox"], [role="radiogroup"]') as HTMLElement;
  
  if (!parentContainer) return;
  
  const items = Array.from(parentContainer.querySelectorAll('[role="menuitem"], [role="option"], [role="radio"]'));
  const currentIndex = items.indexOf(target);
  
  let newIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowDown':
      newIndex = (currentIndex + 1) % items.length;
      break;
    case 'ArrowUp':
      newIndex = (currentIndex - 1 + items.length) % items.length;
      break;
    case 'ArrowRight':
      // For horizontal menus
      if (parentContainer.getAttribute('aria-orientation') !== 'vertical') {
        newIndex = (currentIndex + 1) % items.length;
      }
      break;
    case 'ArrowLeft':
      // For horizontal menus
      if (parentContainer.getAttribute('aria-orientation') !== 'vertical') {
        newIndex = (currentIndex - 1 + items.length) % items.length;
      }
      break;
  }
  
  if (newIndex !== currentIndex) {
    event.preventDefault();
    (items[newIndex] as HTMLElement).focus();
  }
};

// Hook to implement keyboard navigation for a specific component
export const useKeyboardNavigation = (containerRef: React.RefObject<HTMLElement>, options?: {
  vertical?: boolean;
  wrapAround?: boolean;
}) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    if (focusableElements.length === 0) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      
      event.preventDefault();
      
      const currentElement = document.activeElement as HTMLElement;
      const currentIndex = Array.prototype.indexOf.call(focusableElements, currentElement);
      
      let nextIndex;
      if (event.key === 'ArrowDown') {
        nextIndex = options?.wrapAround 
          ? (currentIndex + 1) % focusableElements.length 
          : Math.min(currentIndex + 1, focusableElements.length - 1);
      } else { // ArrowUp
        nextIndex = options?.wrapAround 
          ? (currentIndex - 1 + focusableElements.length) % focusableElements.length 
          : Math.max(currentIndex - 1, 0);
      }
      
      focusableElements[nextIndex]?.focus();
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, options]);
};

// Function to add keyboard shortcuts for common actions
export const addKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Example shortcuts - customize based on your app's needs
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            // Open search modal
            console.log('Opening search...');
            break;
          case 'n':
            event.preventDefault();
            // Create new item
            console.log('Creating new item...');
            break;
          case '/':
            event.preventDefault();
            // Focus search input
            const searchInput = document.querySelector('input[type="search"], [role="search"] input');
            if (searchInput) {
              (searchInput as HTMLElement).focus();
            }
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

// Utility to ensure proper focus management for modal dialogs
export const manageModalFocus = (isOpen: boolean, modalRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
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
    
    // Focus first element when modal opens
    firstElement?.focus();
    
    // Add event listener to trap focus
    document.addEventListener('keydown', handleTabKey);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, modalRef]);
};