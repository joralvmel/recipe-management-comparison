import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import SearchBar from '../components/SearchBar';
import Image from './Image';
import logo from '@assets/icons/logo.png';

const HeroSection: React.FC = () => {
  const { user } = useAuth();
  const { setSearchQuery } = useRecipeSearch();
  const navigate = useNavigate();
  const [typedQuery, setTypedQuery] = useState('');

  const handleSearch = () => {
    setSearchQuery(typedQuery);
    navigate('/search');
  };

  return (
    <section className="hero">
      <Image className="app-logo" src={logo} alt="logo" />
      <h1>
        Welcome {user ? user.name.split(' ')[0] : ""} to <span className="primary-text">Gastro</span>
        <span className="secondary-text">Nest</span>
      </h1>
      <p>
        Discover new recipes and save your favorites in your own recipe nest!
      </p>
      <SearchBar
        placeholder="Search for recipes..."
        value={typedQuery}
        onChange={setTypedQuery}
        onSearch={handleSearch}
      />
    </section>
  );
};

export default HeroSection;
