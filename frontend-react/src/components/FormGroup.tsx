import type { InputProps } from './Input';
import React from 'react';
import Input from './Input';

interface FormGroupProps extends InputProps {
  label: string;
}

const FormGroup = React.forwardRef<HTMLInputElement, FormGroupProps>(
  ({ label, id, ...inputProps }, ref) => {
    return (
      <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <Input id={id} ref={ref} {...inputProps} />
      </div>
    );
  }
);

export default FormGroup;