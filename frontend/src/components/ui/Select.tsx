import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className, ...props }, ref) => {
    const baseClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    const errorClass = error ? 'border-red-500 focus-visible:ring-red-500' : '';
    
    const classes = `${baseClasses} ${errorClass} ${className || ''}`;
    
    // Generate unique IDs for accessibility
    const id = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;
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
        <select
          ref={ref}
          id={id}
          className={classes}
          aria-invalid={!!error}
          aria-describedby={`${errorId ? errorId : ''} ${helperId ? helperId : ''}`.trim()}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';