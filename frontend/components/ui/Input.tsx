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
  const baseClasses = 'block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:outline-none focus:ring-2 transition-all duration-200';
  const focusClasses = 'focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:focus:ring-red-400 dark:focus:border-red-400' : '';
  const commonClasses = `${baseClasses} ${focusClasses} ${errorClasses} ${widthClass} ${className}`;

  const inputClasses = `py-3 px-4 text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${commonClasses}`;
  const textareaClasses = `py-3 px-4 text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${commonClasses}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
        <p className={`mt-2 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;