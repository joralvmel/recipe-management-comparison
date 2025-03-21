import type React from 'react';
import Input from './Input';

interface FormGroupProps {
  label: string;
  type: 'text' | 'number' | 'textarea' | 'star-rating' | 'favorite';
  id: string;
  required?: boolean;
}

const FormGroup: React.FC<FormGroupProps> = ({ label, type, id, required }) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <Input type={type} id={id} required={required} />
    </div>
  );
};

export default FormGroup;
