import React from 'react';
import { Alert, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import { FieldErrors, FieldValues } from 'react-hook-form';

type FormErrorProps<T extends FieldValues> = {
  errors: FieldErrors<T>;
  showAll?: boolean;
};

export const FormError = <T extends FieldValues>({ errors, showAll = true }: FormErrorProps<T>) => {
  // Get all error messages
  const getAllErrors = (): string[] => {
    const errorMessages: string[] = [];

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
    return errorMessages;
  };

  const errorList = getAllErrors();
  
  if (errorList.length === 0) {
    return null;
  }

  return (
    <Collapse in={errorList.length > 0}>
      <Alert 
        severity="error" 
        icon={<ErrorOutline />}
        sx={{ mb: 2 }}
      >
        {showAll ? (
          <List dense>
            {errorList.map((error, index) => (
              <ListItem key={index} disablePadding>
                <ListItemIcon>
                  <ErrorOutline fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={error} />
              </ListItem>
            ))}
          </List>
        ) : (
          <>{errorList[0]}</> // Show only the first error
        )}
      </Alert>
    </Collapse>
  );
};

export default FormError;