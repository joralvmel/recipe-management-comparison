import type React from 'react';
import { NavLink } from 'react-router-dom';

const NavLinks: React.FC = () => {
  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
          Home
        </NavLink>
      </li>
      <li>
        <NavLink to="/search" className={({ isActive }) => (isActive ? 'active' : '')}>
          Search
        </NavLink>
      </li>
      <li>
        <NavLink to="/favorites" className={({ isActive }) => (isActive ? 'active' : '')}>
          Favorites
        </NavLink>
      </li>
      <li>
        <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
          Login
        </NavLink>
      </li>
      <li>
        <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : '')}>
          Register
        </NavLink>
      </li>
    </ul>
  );
};

export default NavLinks;
