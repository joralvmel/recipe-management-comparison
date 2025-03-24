import type React from 'react';
import '@styles/components/_buttons.scss';

interface ButtonProps {
  size: 'small' | 'medium' | 'large';
  type: 'primary' | 'secondary' | 'tertiary';
  children: React.ReactNode;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ size, type, children, disabled = false }) => {
  const className = `${type}-button ${size}-button`;
  return (
    <button type="button" className={className} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
