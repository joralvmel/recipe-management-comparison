import type React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavLinksProps {
  isMobile?: boolean;
  closeMenu?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ isMobile = false, closeMenu }) => {
  const { isSignedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (closeMenu) closeMenu();
  };

  const handleLinkClick = () => {
    if (closeMenu) closeMenu();
  };

  return (
    <ul className={isMobile ? '' : 'nav-links'}>
      <li>
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
          Home
        </NavLink>
      </li>
      <li>
        <NavLink to="/search" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
          Search
        </NavLink>
      </li>
      {isSignedIn ? (
        <>
          <li>
            <NavLink to="/favorites" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
              Favorites
            </NavLink>
          </li>
          <li>
            <NavLink to="/" className={() => ''} onClick={handleLogout}>
              Logout
            </NavLink>
          </li>
        </>
      ) : (
        <>
          <li>
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
              Login
            </NavLink>
          </li>
          <li>
            <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
              Register
            </NavLink>
          </li>
        </>
      )}
    </ul>
  );
};

export default NavLinks;
