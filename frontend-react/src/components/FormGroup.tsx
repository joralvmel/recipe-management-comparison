import type React from 'react';
import Input from './Input';
import type { InputProps } from './Input';

interface FormGroupProps extends InputProps {
  label: string;
}

const FormGroup: React.FC<FormGroupProps> = ({ label, id, ...inputProps }) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <Input {...inputProps} />
    </div>
  );
};

export default FormGroup;
