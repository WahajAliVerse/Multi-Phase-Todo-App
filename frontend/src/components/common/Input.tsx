import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`space-y-1 ${widthClass}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
          error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;