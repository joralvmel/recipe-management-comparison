import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import NavLinks from './NavLinks';
import '@styles/components/_navbar.scss';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMobileMenu]);

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
      <div ref={mobileMenuRef} className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLinks isMobile closeMenu={closeMobileMenu} />
      </div>
    </nav>
  );
};

export default Navbar;
