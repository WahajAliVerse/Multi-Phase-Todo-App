'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  as?: 'input' | 'textarea';
  rows?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  as = 'input',
  rows = 3,
  className = '',
  ...props
}) => {
  const widthClass = fullWidth ? 'w-full' : '';
  const baseClasses = 'block w-full rounded-lg border border-input bg-background shadow-sm focus:outline-none focus:ring-2 transition-all duration-200';
  const focusClasses = 'focus:ring-ring focus:border-ring';
  const errorClasses = error ? 'border-destructive focus:ring-destructive focus:border-destructive' : '';
  const commonClasses = `${baseClasses} ${focusClasses} ${errorClasses} ${widthClass} ${className}`;

  const inputClasses = `py-3 px-4 text-base text-foreground placeholder-muted-foreground ${commonClasses}`;
  const textareaClasses = `py-3 px-4 text-base text-foreground placeholder-muted-foreground ${commonClasses}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea
          className={textareaClasses}
          rows={rows}
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
        />
      ) : (
        <input
          className={inputClasses}
          {...props as React.InputHTMLAttributes<HTMLInputElement>}
        />
      )}
      {(helperText || error) && (
        <p className={`mt-2 text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;