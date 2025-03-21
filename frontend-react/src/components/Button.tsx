import type React from 'react';
import '@styles/components/_buttons.scss';

interface ButtonProps {
  size: 'small' | 'medium' | 'large';
  type: 'primary' | 'secondary' | 'tertiary';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ size, type, children }) => {
  const className = `${type}-button ${size}-button`;
  return (
    <button type="button" className={className}>{children}</button>
  );
};

export default Button;
