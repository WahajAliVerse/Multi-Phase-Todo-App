// Accessibility documentation for component usage
import React from 'react';

// Documentation for accessible component usage

// 1. Accessible Button Component Documentation
export const AccessibleButtonDoc = () => {
  return (
    <div>
      <h2>Accessible Button Component</h2>
      <p>
        The accessible button component ensures proper keyboard navigation and screen reader support.
      </p>
      
      <h3>Usage:</h3>
      <pre>
        {`import { AccessibleButton } from './AccessibleButton';

// Basic usage
<AccessibleButton onClick={handleClick}>
  Click me
</AccessibleButton>

// With ARIA attributes
<AccessibleButton 
  onClick={handleClick}
  aria-label="Close dialog"
  aria-describedby="close-description"
>
  ×
</AccessibleButton>

// Disabled state
<AccessibleButton 
  onClick={handleClick}
  disabled={true}
  aria-disabled="true"
>
  Disabled Button
</AccessibleButton>`}
      </pre>
      
      <h3>Accessibility Features:</h3>
      <ul>
        <li>Proper role attribute (button)</li>
        <li>Keyboard focus management</li>
        <li>Screen reader announcements</li>
        <li>Proper ARIA attributes</li>
        <li>Visible focus indicators</li>
      </ul>
      
      <h3>Best Practices:</h3>
      <ul>
        <li>Always provide meaningful text or aria-label</li>
        <li>Use appropriate semantic HTML</li>
        <li>Ensure sufficient color contrast</li>
        <li>Provide visible focus indicators</li>
        <li>Test with keyboard navigation</li>
      </ul>
    </div>
  );
};

// 2. Accessible Form Component Documentation
export const AccessibleFormDoc = () => {
  return (
    <div>
      <h2>Accessible Form Component</h2>
      <p>
        The accessible form component ensures proper labeling, error messaging, and keyboard navigation.
      </p>
      
      <h3>Usage:</h3>
      <pre>
        {`import { AccessibleForm, AccessibleInput, AccessibleSelect } from './AccessibleForm';

<AccessibleForm onSubmit={handleSubmit}>
  <AccessibleInput
    id="name"
    label="Full Name"
    type="text"
    required
    aria-describedby="name-help"
  />
  <div id="name-help" className="help-text">
    Enter your full name as it appears on official documents
  </div>
  
  <AccessibleSelect
    id="country"
    label="Country"
    options={countries}
    required
  />
  
  <AccessibleInput
    id="email"
    label="Email Address"
    type="email"
    required
    error={emailError}
    aria-invalid={!!emailError}
    aria-describedby="email-error"
  />
  <div id="email-error" className="error-text" role="alert">
    {emailError}
  </div>
  
  <AccessibleButton type="submit">Submit</AccessibleButton>
</AccessibleForm>`}
      </pre>
      
      <h3>Accessibility Features:</h3>
      <ul>
        <li>Proper labeling with htmlFor/id associations</li>
        <li>Error messaging with ARIA attributes</li>
        <li>Keyboard navigation support</li>
        <li>Screen reader announcements</li>
        <li>Proper form structure</li>
      </ul>
      
      <h3>Best Practices:</h3>
      <ul>
        <li>Associate labels with form controls using htmlFor/id</li>
        <li>Provide clear error messages</li>
        <li>Use aria-describedby for help text</li>
        <li>Use aria-invalid for error states</li>
        <li>Ensure logical tab order</li>
      </ul>
    </div>
  );
};

// 3. Accessible Modal Component Documentation
export const AccessibleModalDoc = () => {
  return (
    <div>
      <h2>Accessible Modal Component</h2>
      <p>
        The accessible modal component ensures proper focus management and keyboard navigation.
      </p>
      
      <h3>Usage:</h3>
      <pre>
        {`import { AccessibleModal } from './AccessibleModal';

<AccessibleModal 
  isOpen={isModalOpen}
  onClose={closeModal}
  title="Confirmation Dialog"
  initialFocusRef={cancelButtonRef}
>
  <p>Are you sure you want to delete this item?</p>
  <div className="modal-actions">
    <AccessibleButton 
      ref={cancelButtonRef}
      onClick={closeModal}
    >
      Cancel
    </AccessibleButton>
    <AccessibleButton 
      variant="danger"
      onClick={confirmDelete}
    >
      Delete
    </AccessibleButton>
  </div>
</AccessibleModal>`}
      </pre>
      
      <h3>Accessibility Features:</h3>
      <ul>
        <li>Focus trapping within modal</li>
        <li>Initial focus management</li>
        <li>Proper ARIA attributes (role="dialog", aria-modal, etc.)</li>
        <li>Escape key to close</li>
        <li>Click outside to close</li>
      </ul>
      
      <h3>Best Practices:</h3>
      <ul>
        <li>Trap focus within the modal</li>
        <li>Set initial focus to the first interactive element</li>
        <li>Allow closing with Escape key</li>
        <li>Provide clear close affordances</li>
        <li>Restore focus to the triggering element when closed</li>
      </ul>
    </div>
  );
};

// 4. Accessible Navigation Component Documentation
export const AccessibleNavigationDoc = () => {
  return (
    <div>
      <h2>Accessible Navigation Component</h2>
      <p>
        The accessible navigation component ensures proper keyboard navigation and screen reader support.
      </p>
      
      <h3>Usage:</h3>
      <pre>
        {`import { AccessibleNav, AccessibleMenu, AccessibleMenuItem } from './AccessibleNavigation';

<AccessibleNav aria-label="Main navigation">
  <AccessibleMenu>
    <AccessibleMenuItem href="/">Home</AccessibleMenuItem>
    <AccessibleMenuItem href="/about">About</AccessibleMenuItem>
    <AccessibleMenuItem href="/services">Services</AccessibleMenuItem>
    <AccessibleMenuItem href="/contact">Contact</AccessibleMenuItem>
  </AccessibleMenu>
</AccessibleNav>`}
      </pre>
      
      <h3>Accessibility Features:</h3>
      <ul>
        <li>Proper landmark roles</li>
        <li>Keyboard navigation support (arrow keys, Enter, etc.)</li>
        <li>Screen reader announcements</li>
        <li>Current page indication</li>
        <li>Logical tab order</li>
      </ul>
      
      <h3>Best Practices:</h3>
      <ul>
        <li>Use proper ARIA roles for navigation landmarks</li>
        <li>Provide keyboard navigation for menu items</li>
        <li>Indicate current page or active item</li>
        <li>Ensure sufficient color contrast</li>
        <li>Provide visible focus indicators</li>
      </ul>
    </div>
  );
};

// 5. Accessibility Utilities Documentation
export const AccessibilityUtilitiesDoc = () => {
  return (
    <div>
      <h2>Accessibility Utilities</h2>
      <p>
        Various utilities to help implement accessibility features.
      </p>
      
      <h3>Focus Management:</h3>
      <pre>
        {`import { useFocusManagement } from './utils/accessibility';

const MyComponent = () => {
  const { setFocus, trapFocus } = useFocusManagement();
  
  // Example of programmatically setting focus
  const handleAction = () => {
    // Perform action
    setFocus(document.getElementById('result'));
  };
  
  // Example of trapping focus within a container
  const containerRef = useRef();
  useEffect(() => {
    if (isOpen) {
      trapFocus(containerRef.current);
    }
  }, [isOpen]);
  
  return (
    <div ref={containerRef}>
      {/* Component content */}
    </div>
  );
};`}
      </pre>
      
      <h3>ARIA Live Regions:</h3>
      <pre>
        {`import { useAriaLiveAnnouncer } from './utils/accessibility';

const NotificationComponent = () => {
  const { announce } = useAriaLiveAnnouncer();
  
  const handleAction = () => {
    // Perform action
    announce('Item added successfully', 'polite');
  };
  
  return (
    <button onClick={handleAction}>Add Item</button>
  );
};`}
      </pre>
      
      <h3>Best Practices:</h3>
      <ul>
        <li>Use ARIA live regions for dynamic content updates</li>
        <li>Implement proper focus management</li>
        <li>Use semantic HTML elements when possible</li>
        <li>Provide alternative text for non-text content</li>
        <li>Ensure all functionality is keyboard accessible</li>
      </ul>
    </div>
  );
};

// Main accessibility documentation component
export const AccessibilityDocumentation = () => {
  return (
    <div className="accessibility-documentation">
      <h1>Accessibility Documentation</h1>
      <p>
        This documentation provides guidelines for creating accessible UI components 
        that comply with WCAG 2.1 AA standards.
      </p>
      
      <AccessibleButtonDoc />
      <AccessibleFormDoc />
      <AccessibleModalDoc />
      <AccessibleNavigationDoc />
      <AccessibilityUtilitiesDoc />
      
      <h2>General Accessibility Guidelines</h2>
      <ul>
        <li><strong>Perceivable</strong>: Provide text alternatives for non-text content, ensure content is adaptable and distinguishable</li>
        <li><strong>Operable</strong>: Make all functionality available from a keyboard, provide enough time for users to read and use content, avoid content that causes seizures</li>
        <li><strong>Understandable</strong>: Make text readable and understandable, make the operation of user interface components predictable</li>
        <li><strong>Robust</strong>: Maximize compatibility with current and future user tools</li>
      </ul>
      
      <h2>Testing Resources</h2>
      <ul>
        <li>Use automated tools like axe-core for initial testing</li>
        <li>Perform manual keyboard navigation testing</li>
        <li>Test with screen readers (NVDA, JAWS, VoiceOver)</li>
        <li>Verify color contrast ratios meet WCAG standards</li>
        <li>Test with reduced motion settings enabled</li>
      </ul>
    </div>
  );
};

// Export all documentation components
export default {
  AccessibleButtonDoc,
  AccessibleFormDoc,
  AccessibleModalDoc,
  AccessibleNavigationDoc,
  AccessibilityUtilitiesDoc,
  AccessibilityDocumentation,
};