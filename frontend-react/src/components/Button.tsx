import type React from 'react';
import '@styles/components/_buttons.scss';

interface ButtonProps {
  size: 'small' | 'medium' | 'large';
  type: 'primary' | 'secondary' | 'tertiary';
  children: React.ReactNode;
  disabled?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ size, type, children, disabled = false, htmlType = 'button', className = '' }) => {
  const combinedClassName = `${type}-button ${size}-button ${className}`;
  return (
    <button type={htmlType} className={combinedClassName} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;