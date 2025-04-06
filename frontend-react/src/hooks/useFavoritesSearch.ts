import { useState, useMemo, useEffect } from 'react';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import { useFavorites } from '../context/FavoriteContext';
import { cardData } from '../data/cardData';

const useFavoritesSearch = () => {
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

  return {
    favoritesSearchQuery,
    setFavoritesSearchQuery,
    paginatedFavorites,
  };
};

export default useFavoritesSearch;