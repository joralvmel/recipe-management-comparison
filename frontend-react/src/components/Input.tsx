import type React from 'react';
import '@styles/components/_inputs.scss';

export interface InputProps {
  inputType?: 'email' | 'password' | 'text';
  id?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
                                       inputType = 'text',
                                       id,
                                       className,
                                       placeholder,
                                       required,
                                       value,
                                       onChange,
                                     }) => {
  return (
    <input
      type={inputType}
      className={className}
      id={id}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
    />
  );
};

export default Input;
