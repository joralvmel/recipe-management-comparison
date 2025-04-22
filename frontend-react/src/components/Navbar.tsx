import type React from 'react';
import Logo from '@components/Logo';
import NavLinks from '@components/NavLinks';
import useMobileMenu from '@hooks/useMobileMenu';
import '@styles/components/_navbar.scss';

const Navbar: React.FC = () => {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, mobileMenuRef } = useMobileMenu();

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
