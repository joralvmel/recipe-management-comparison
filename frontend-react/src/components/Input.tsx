import type React from 'react';
import '@styles/components/_inputs.scss';

export interface InputProps {
  inputType?: 'button' | 'checkbox' | 'email' | 'number' | 'password' | 'radio' | 'text';
  id?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  defaultChecked?: boolean;
}

const Input: React.FC<InputProps> = ({ inputType, id, className, placeholder, required, defaultChecked }) => {
  return (
    <input
      type={inputType}
      className={className}
      id={id}
      placeholder={placeholder}
      required={required}
      defaultChecked={defaultChecked}
    />
  );
};

export default Input;
