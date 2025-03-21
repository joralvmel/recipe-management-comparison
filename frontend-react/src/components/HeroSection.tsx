import type React from 'react';
import SearchBar from '../components/SearchBar';
import logo from '@assets/icons/logo.png';

const HeroSection: React.FC = () => {
  return (
    <section className="hero">
      <img className="app-logo" src={logo} alt="logo" />
      <h1>
        Welcome to <span className="primary-text">Gastro</span>
        <span className="secondary-text">Nest</span>
      </h1>
      <p>
        Discover new recipes and save your favorites in your own recipe nest!
      </p>
      <SearchBar placeholder="Search for recipes..." />
    </section>
  );
};

export default HeroSection;
