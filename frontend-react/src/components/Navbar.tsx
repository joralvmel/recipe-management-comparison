import type React from 'react';
import { useState } from 'react';
import Logo from './Logo';
import NavLinks from './NavLinks';
import '@styles/components/_navbar.scss';

interface NavbarProps {
  isSignedIn: boolean;
  setIsSignedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ isSignedIn, setIsSignedIn }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <Logo />
      <NavLinks isSignedIn={isSignedIn} setIsSignedIn={setIsSignedIn} />
      <div
        className="menu-icon"
        onClick={toggleMobileMenu}
        onKeyUp={(e) => (e.key === 'Enter' || e.key === ' ') && toggleMobileMenu()}
      >
        &#9776;
      </div>
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLinks isSignedIn={isSignedIn} setIsSignedIn={setIsSignedIn} />
      </div>
    </nav>
  );
};

export default Navbar;
