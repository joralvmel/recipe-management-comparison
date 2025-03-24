import type React from 'react';
import { filters } from '../data/filterData';
import { cardData } from '../data/cardData';
import '@styles/pages/_favorites.scss';
import Filters from '../components/Filters';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';

const Favorites: React.FC = () => {
  const favoriteCards = cardData.filter(card => card.isFavorite);

  return (
    <div className="favorites container">
      <h1>Search for Recipes</h1>
      <Filters displayFilters={false} filters={filters} />
      <Cards cards={favoriteCards} />
      <Pagination />
    </div>
  );
};

export default Favorites;