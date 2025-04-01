import type React from 'react';
import { useState, useMemo } from 'react';
import Filters from '../components/Filters';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';
import '@styles/pages/_favorites.scss';
import { cardData } from '../data/cardData';
import { filters } from '../data/filterData';

const Favorites: React.FC = () => {
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');
  const favoriteCards = useMemo(
    () =>
      cardData.filter(
        (card) =>
          card.isFavorite &&
          card.title.toLowerCase().includes(favoritesSearchQuery.toLowerCase())
      ),
    [favoritesSearchQuery]
  );

  return (
    <div className="favorites container">
      <h1>Search for Favorite Recipes</h1>
      <Filters
        displayFilters={false}
        filters={filters}
        searchQuery={favoritesSearchQuery}
        onSearchQueryChange={setFavoritesSearchQuery}
        autoSearch={true}
      />
      <Cards cards={favoriteCards} />
      <Pagination />
    </div>
  );
};

export default Favorites;
