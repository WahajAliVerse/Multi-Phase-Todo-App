import React from 'react';
import { FieldValues, useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { Box, FormControl, FormHelperText } from '@mui/material';

type BaseFormProps<T extends FieldValues> = {
  children: (methods: UseFormReturn<T>) => React.ReactNode;
  onSubmit: (data: T) => void;
  schema?: ZodSchema<T>;
  formOptions?: UseFormProps<T>;
  className?: string;
};

export const BaseForm = <T extends FieldValues>({
  children,
  onSubmit,
  schema,
  formOptions = {},
  className
}: BaseFormProps<T>) => {
  // Using type assertion to handle the zodResolver type incompatibility
  const resolver = schema ? (zodResolver as any)(schema) : undefined;

  const formMethods = useForm<T>({
    ...formOptions,
    ...(resolver ? { resolver } : {}),
    mode: 'onChange' // Enables real-time validation as user types
  });

  const {
    handleSubmit,
    formState: { errors, isValid },
  } = formMethods;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} className={className}>
      <FormControl fullWidth error={!!Object.keys(errors).length}>
        {children(formMethods)}
        {Object.keys(errors).length > 0 && (
          <FormHelperText>
            Please correct the highlighted errors
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

export default BaseForm;