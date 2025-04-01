import type React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import { cardData } from '../data/cardData';
import { filters } from '../data/filterData';
import Filters from '../components/Filters';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';
import '@styles/pages/_favorites.scss';

const Favorites: React.FC = () => {
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');
  const { setTotalResults } = useRecipeSearch();

  const favoriteCards = useMemo(
    () =>
      cardData.filter(
        (card) =>
          card.isFavorite &&
          card.title.toLowerCase().includes(favoritesSearchQuery.toLowerCase())
      ),
    [favoritesSearchQuery]
  );

  useEffect(() => {
    setTotalResults(favoriteCards.length);
  }, [favoriteCards, setTotalResults]);

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
