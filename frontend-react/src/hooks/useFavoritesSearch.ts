import { useState, useMemo, useEffect } from 'react';
import { useFavoritesSearchContext } from '../context/FavoriteSearchContext';
import { useAuth } from '../context/AuthContext';
import { fetchFavoritesWithDetails, filterFavoriteRecipes } from '../services/favoriteService';
import type { RecipeType } from '../types';

const useFavoritesSearch = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeType[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    searchQuery: favoritesSearchQuery,
    setSearchQuery: setFavoritesSearchQuery,
    pageNumber,
    resultsPerPage,
    setTotalResults,
    setPageNumber,
    setResultsPerPage,
  } = useFavoritesSearchContext();

  const { user, isSignedIn } = useAuth();
  const token = user?.token ? `Bearer ${user.token}` : '';

  useEffect(() => {
    setPageNumber(1);
    setResultsPerPage(10);
  }, [setPageNumber, setResultsPerPage]);

  useEffect(() => {
    const loadFavoriteRecipes = async () => {
      if (isSignedIn && token) {
        const userId = user?.id || 'default-user-id';
        setLoading(true);
        try {
          const loadedRecipes = await fetchFavoritesWithDetails(token, userId);
          setFavoriteRecipes(loadedRecipes);
        } catch (error) {
          console.error('Error loading favorite recipes:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFavoriteRecipes();
  }, [isSignedIn, token, user?.id]);

  const favoriteCards = useMemo(() => {
    return filterFavoriteRecipes(favoriteRecipes, favoritesSearchQuery);
  }, [favoritesSearchQuery, favoriteRecipes]);

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
