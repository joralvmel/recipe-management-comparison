import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeSearch } from '../context/RecipeSearchContext';

const useHeroSection = () => {
  const { setSearchQuery } = useRecipeSearch();
  const navigate = useNavigate();
  const [typedQuery, setTypedQuery] = useState('');

  const handleSearch = () => {
    setSearchQuery(typedQuery);
    navigate('/search');
  };

  return {
    typedQuery,
    setTypedQuery,
    handleSearch,
  };
};

export default useHeroSection;