import type React from 'react';
import { filters } from '../data/filterData';
import { cardData } from '../data/cardData';
import '@styles/pages/_search.scss';
import Filters from '../components/Filters';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';

const Search: React.FC = () => {
  return (
    <div className="search container">
      <h1>Search for Recipes</h1>
      <Filters filters={filters} />
      <Cards cards={cardData} />
      <Pagination />
    </div>
  );
};

export default Search;
