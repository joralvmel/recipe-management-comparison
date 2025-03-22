import type React from 'react';
import '@styles/components/_inputs.scss';

export interface InputProps {
  inputType?: 'button' | 'checkbox' | 'email' | 'number' | 'password' | 'radio' | 'text';
  type: 'text' | 'number' | 'textarea' | 'star-rating' | 'favorite';
  id?: string;
  placeholder?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ inputType, type, id, placeholder, required }) => {
  const className = `input-${type}`;
  return (
    <input type={inputType} className={className} id={id} placeholder={placeholder} required={required} />
  );
};

export default Input;
