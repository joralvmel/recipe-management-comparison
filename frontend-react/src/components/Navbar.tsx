import type React from 'react';
import Logo from './Logo';
import NavLinks from './NavLinks';
import '@styles/components/_navbar.scss';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <Logo />
      <NavLinks />
    </nav>
  );
};

export default Navbar;
