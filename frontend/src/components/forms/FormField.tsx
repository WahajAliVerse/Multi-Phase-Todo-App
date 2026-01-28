import React from 'react';
import { Controller, UseFormReturn, FieldValues } from 'react-hook-form';
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Box,
  Typography,
} from '@mui/material';
import { ZodSchema } from 'zod';

type FormFieldProps<T extends FieldValues> = {
  name: keyof T;
  label: string;
  control: UseFormReturn<T>['control'];
  type?: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  schema?: ZodSchema;
};

export const FormField = <T extends FieldValues>({
  name,
  label,
  control,
  type = 'text',
  options,
  required = false,
  placeholder,
  helperText,
  disabled = false,
  multiline = false,
  rows = 4,
  schema,
}: FormFieldProps<T>) => {
  const fieldProps = {
    name: name as any, // Type assertion to handle the Path<T> constraint
    control,
  };

  const renderInput = (field: any) => {
    const commonProps = {
      ...field,
      label,
      required,
      placeholder,
      disabled,
      error: !!field.meta?.error,
      helperText: field.meta?.error || helperText,
      fullWidth: true,
    };

    switch (type) {
      case 'select':
        return (
          <FormControl fullWidth error={!!field.meta?.error} disabled={disabled}>
            <InputLabel>{label}</InputLabel>
            <Select
              {...commonProps}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {field.meta?.error && <FormHelperText>{field.meta.error}</FormHelperText>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={!!field.value}
                disabled={disabled}
              />
            }
            label={label}
          />
        );

      case 'radio':
        return (
          <FormControl component="fieldset">
            <Typography component="legend">{label}</Typography>
            <RadioGroup
              {...field}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            {...commonProps}
            multiline={multiline}
            rows={rows}
            variant="outlined"
          />
        );

      default:
        return (
          <TextField
            {...commonProps}
            type={type}
            variant="outlined"
            multiline={multiline}
            rows={multiline ? rows : undefined}
          />
        );
    }
  };

  return (
    <Box mb={2}>
      <Controller
        {...fieldProps}
        render={({ field, fieldState }) => renderInput({ ...field, meta: fieldState })}
      />
    </Box>
  );
};

export default FormField;