import React from 'react';
import '@styles/components/_inputs.scss';

export interface InputProps {
  inputType?: 'email' | 'password' | 'text';
  id?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputType = 'text',
      id,
      className,
      placeholder,
      required,
      value,
      onChange,
      onKeyDown,
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type={inputType}
        className={className}
        id={id}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    );
  }
);

export default Input;
