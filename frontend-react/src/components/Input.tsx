import type React from 'react';
import '@styles/components/_inputs.scss';

interface InputProps {
  type: 'text' | 'number' | 'textarea' | 'star-rating' | 'favorite';
  id?: string;
  placeholder?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ type, id, placeholder, required }) => {
  const className = `input-${type}`;
  return (
    <input className={className} id={id} placeholder={placeholder} required={required} />
  );
};

export default Input;