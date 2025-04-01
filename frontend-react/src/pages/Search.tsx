import type React from 'react';
import { useEffect } from 'react';
import { filters } from '../data/filterData';
import { cardData } from '../data/cardData';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import Filters from '../components/Filters';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';
import '@styles/pages/_search.scss';

const Search: React.FC = () => {
  const { searchQuery, setSearchQuery, setTotalResults } = useRecipeSearch();

  useEffect(() => {
    setTotalResults(50);
  }, [setTotalResults]);

  return (
    <div className="search container">
      <h1>Search for Recipes</h1>
      <Filters filters={filters} searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
      <Cards cards={cardData} />
      <Pagination />
    </div>
  );
};

export default Search;
