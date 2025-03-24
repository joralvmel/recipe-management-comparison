import type React from 'react';
import { Link } from 'react-router-dom';
import logo from '@assets/icons/logo.png';
import Image from './Image';

const Logo: React.FC = () => {
  return (
    <Link to="/">
      <div className="logo">
        <Image className="app-logo" src={logo} alt="logo" />
        <span className="primary-text">Gastro</span>
        <span className="secondary-text">Nest</span>
      </div>
    </Link>
  );
};

export default Logo;
