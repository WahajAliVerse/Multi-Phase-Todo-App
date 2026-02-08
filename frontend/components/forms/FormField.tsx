import React from 'react';
import { useFormContext } from 'react-hook-form';
import Input from '@/components/ui/Input';

interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  fullWidth = false,
}) => {
  const { register, formState: { errors } } = useFormContext();
  
  const error = errors[name]?.message as string;
  
  return (
    <Input
      label={label}
      error={error}
      placeholder={placeholder}
      fullWidth={fullWidth}
      {...register(name, { required: required ? `${label || name} is required` : false })}
      type={type}
    />
  );
};

export default FormField;