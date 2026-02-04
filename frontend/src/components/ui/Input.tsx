import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const baseClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    const errorClass = error ? 'border-red-500 focus-visible:ring-red-500' : '';
    
    const classes = `${baseClasses} ${errorClass} ${className || ''}`;
    
    // Generate unique IDs for accessibility
    const id = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${id}-error` : undefined;
    const helperId = helperText && !error ? `${id}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium mb-1 text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={classes}
          aria-invalid={!!error}
          aria-describedby={`${errorId ? errorId : ''} ${helperId ? helperId : ''}`.trim()}
          {...props}
        />
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1 text-sm text-gray-500"
            aria-live="polite"
          >
            {helperText}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';