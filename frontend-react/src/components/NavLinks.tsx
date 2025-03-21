import type React from 'react';
import { Link } from 'react-router-dom';

const NavLinks: React.FC = () => {
  return (
    <ul className="nav-links">
      <li className="active"><Link to="/">Home</Link></li>
      <li><Link to="/search">Search</Link></li>
      <li><Link to="/favorites">Favorites</Link></li>
      <li><Link to="/login">Login</Link></li>
      <li><Link to="/register">Register</Link></li>
    </ul>
  );
};

export default NavLinks;
