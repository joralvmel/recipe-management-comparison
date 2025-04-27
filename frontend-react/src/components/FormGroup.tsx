import type { InputProps } from '@components/Input';
import React from 'react';
import Input from '@components/Input';

interface FormGroupProps extends InputProps {
  label: string,
  type?: string
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