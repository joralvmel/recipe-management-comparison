import { useState, useMemo, useEffect } from 'react';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import { useFavoriteContext } from '../context/FavoriteContext';
import { cardData } from '../data/cardData';
import type { RecipeType } from '../types';

const useFavoritesSearch = () => {
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    setTotalResults,
    pageNumber,
    resultsPerPage,
    setResultsPerPage,
    setPageNumber,
  } = useRecipeSearch();
  const { isFavorite } = useFavoriteContext();

  useEffect(() => {
    setPageNumber(1);
    setResultsPerPage(10);
  }, [setPageNumber, setResultsPerPage]);

  const favoriteCards = useMemo(() => {
    setLoading(true);
    const filteredCards = cardData
      .filter(
        (card) =>
          card.id !== undefined &&
          isFavorite(card.id.toString()) &&
          card.title?.toLowerCase().includes(favoritesSearchQuery.toLowerCase())
      )
      .map((card) => ({
        id: Number(card.id),
        title: card.title || '',
        image: card.image || '',
        readyInMinutes: card.readyInMinutes || 0,
        healthScore: card.healthScore || 0,
        cuisines: card.cuisines || [],
        dishTypes: card.dishTypes || [],
        diets: card.diets || [],
        servings: 0,
        analyzedInstructions: [],
        ingredients: [],
      })) as RecipeType[];

    setLoading(false);
    return filteredCards;
  }, [favoritesSearchQuery, isFavorite]);

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
    loading,
  };
};

export default useFavoritesSearch;
