import type React from 'react';
import '@styles/components/_inputs.scss';

export interface InputProps {
  inputType?: 'email' | 'password' | 'text';
  id?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ inputType, id, className, placeholder, required }) => {
  return (
    <input
      type={inputType}
      className={className}
      id={id}
      placeholder={placeholder}
      required={required}
    />
  );
};

export default Input;
