import type React from 'react';
import '@styles/components/_navbar.scss';
import Logo from './Logo';
import NavLinks from './NavLinks';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <Logo />
      <NavLinks />
    </nav>
  );
};

export default Navbar;
