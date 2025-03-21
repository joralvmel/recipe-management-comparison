import type React from 'react';
import '@styles/components/_inputs.scss';

interface InputProps {
  type: 'text' | 'number' | 'textarea' | 'star-rating' | 'favorite';
  placeholder: string;
}

const Input: React.FC<InputProps> = ({ type, placeholder }) => {
  const className = `input-${type}`;
  return (
    <input className={className} placeholder={placeholder} />
  );
};

export default Input;
