import type React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import { useFavorites } from '../context/FavoriteContext';
import { cardData } from '../data/cardData';
import { filters } from '../data/filterData';
import Filters from '../components/Filters';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';
import '@styles/pages/_favorites.scss';

const Favorites: React.FC = () => {
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');
  const { setTotalResults, pageNumber, resultsPerPage } = useRecipeSearch();
  const { isFavorite } = useFavorites();

  const favoriteCards = useMemo(
    () =>
      cardData.filter(
        (card) =>
          isFavorite(card.id.toString()) &&
          card.title.toLowerCase().includes(favoritesSearchQuery.toLowerCase())
      ),
    [favoritesSearchQuery, isFavorite]
  );

  useEffect(() => {
    setTotalResults(favoriteCards.length);
  }, [favoriteCards, setTotalResults]);

  const paginatedFavorites = useMemo(() => {
    const startIndex = (pageNumber - 1) * resultsPerPage;
    return favoriteCards.slice(startIndex, startIndex + resultsPerPage);
  }, [favoriteCards, pageNumber, resultsPerPage]);

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
      <Cards cards={paginatedFavorites} />
      <Pagination />
    </div>
  );
};

export default Favorites;
