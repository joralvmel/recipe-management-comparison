import type React from 'react';
import logo from '@assets/icons/logo.png';
import SearchBar from '../components/SearchBar';
import Image from './Image.tsx';

const HeroSection: React.FC = () => {
  return (
    <section className="hero">
      <Image className="app-logo" src={logo} alt="logo" />
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
