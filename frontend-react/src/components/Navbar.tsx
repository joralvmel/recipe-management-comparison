import type React from 'react';
import { useState } from 'react';
import '@styles/components/_navbar.scss';
import Logo from './Logo';
import NavLinks from './NavLinks';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <Logo />
      <NavLinks />
      <div
        className="menu-icon"
        onClick={toggleMobileMenu}
        onKeyUp={(e) => (e.key === 'Enter' || e.key === ' ') && toggleMobileMenu()}
      >
        &#9776;
      </div>
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLinks />
      </div>
    </nav>
  );
};

export default Navbar;
