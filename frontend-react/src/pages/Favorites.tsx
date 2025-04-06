import type React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import { useFavorites } from '../context/FavoriteContext';
import { cardData } from '../data/cardData';
import SearchInput from '../components/SearchInput';
import Cards from '../components/Cards';
import Pagination from '../components/Pagination';
import '@styles/pages/_favorites.scss';

const Favorites: React.FC = () => {
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');
  const {
    setTotalResults,
    pageNumber,
    resultsPerPage,
    setResultsPerPage,
    setPageNumber,
  } = useRecipeSearch();
  const { isFavorite } = useFavorites();

  useEffect(() => {
    setPageNumber(1);
    setResultsPerPage(10);
  }, [setPageNumber, setResultsPerPage]);

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
      <SearchInput
        placeholder="Search Favorites"
        value={favoritesSearchQuery}
        onChange={setFavoritesSearchQuery}
      />
      <Cards cards={paginatedFavorites} />
      <Pagination />
    </div>
  );
};

export default Favorites;
