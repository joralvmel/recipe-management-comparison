import type React from 'react';
import '@styles/components/_loader.scss';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const Loader: React.FC<LoaderProps> = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className={`loader-container loader-${size}`}>
      <div className="loader-spinner" />
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

export default Loader;