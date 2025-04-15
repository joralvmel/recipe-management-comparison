import type { RecipeType } from '../types';
import { useState, useMemo, useEffect } from 'react';
import { useRecipeSearch } from '../context/RecipeSearchContext';
import { useAuth } from '../context/AuthContext';
import { fetchFavoritesWithDetails, filterFavoriteRecipes } from '../services/favoriteService';

const useFavoritesSearch = () => {
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeType[]>([]);
  const [loading, setLoading] = useState(false);

  const { setTotalResults, pageNumber, resultsPerPage, setResultsPerPage, setPageNumber } =
    useRecipeSearch();
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
