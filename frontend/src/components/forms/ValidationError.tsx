import React from 'react';
import { FieldError, FieldErrors } from 'react-hook-form';
import { ZodIssue } from 'zod';
import { Alert, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

type ValidationErrorProps = {
  error?: FieldError | string;
  errors?: FieldErrors<any>;
  issues?: ZodIssue[];
  showAllErrors?: boolean;
};

export const ValidationError: React.FC<ValidationErrorProps> = ({
  error,
  errors,
  issues,
  showAllErrors = true
}) => {
  // Collect all error messages
  const errorMessages: string[] = [];

  // Add single error if provided
  if (error) {
    if (typeof error === 'string') {
      errorMessages.push(error);
    } else {
      errorMessages.push(error.message || 'Field has an error');
    }
  }

  // Add field errors if provided
  if (errors) {
    const collectErrors = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && 'message' in value) {
          errorMessages.push(`${fieldPath}: ${(value as any).message}`);
        } else if (value && typeof value === 'object') {
          collectErrors(value, fieldPath);
        }
      }
    };

    collectErrors(errors);
  }

  // Add Zod issues if provided
  if (issues) {
    issues.forEach(issue => {
      errorMessages.push(`${issue.path.join('.')}: ${issue.message}`);
    });
  }

  // If no errors, don't render anything
  if (errorMessages.length === 0) {
    return null;
  }

  return (
    <Collapse in={errorMessages.length > 0}>
      <Alert 
        severity="error" 
        icon={<ErrorOutline />}
        sx={{ mt: 1, mb: 2 }}
      >
        {showAllErrors ? (
          <List dense>
            {errorMessages.slice(0, 5).map((msg, index) => ( // Limit to 5 errors to avoid clutter
              <ListItem key={index} disablePadding>
                <ListItemIcon>
                  <ErrorOutline fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={msg} />
              </ListItem>
            ))}
            {errorMessages.length > 5 && (
              <ListItem disablePadding>
                <ListItemText 
                  primary={`And ${errorMessages.length - 5} more errors...`} 
                />
              </ListItem>
            )}
          </List>
        ) : (
          <>{errorMessages[0]}</> // Show only the first error
        )}
      </Alert>
    </Collapse>
  );
};

export default ValidationError;