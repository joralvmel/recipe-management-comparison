import type React from 'react';
import '@styles/components/_buttons.scss';

interface ButtonProps {
  size: 'small' | 'medium' | 'large';
  type: 'primary' | 'secondary' | 'tertiary';
}

const Button: React.FC<ButtonProps> = ({ size, type }) => {
  const className = `${type}-button ${size}-button`;
  return (
    <button type="button" className={className}>Search</button>
  );
};

export default Button;
