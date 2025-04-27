import { useState, useCallback } from 'react';
import { useFavoriteContext } from '@context/FavoriteContext';
import { useAuth } from '@context/AuthContext';
import { useSnackbar } from '@context/SnackbarContext';

const useFavorite = (id: string) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoriteContext();
  const { isSignedIn } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFavoriteChange = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const wasFavorite = isFavorite(id);

      if (wasFavorite) {
        await removeFromFavorites(id);
        showSnackbar('Recipe removed from favorites', 'success');
      } else {
        await addToFavorites(id);
        showSnackbar('Recipe added to favorites', 'success');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, isFavorite, addToFavorites, removeFromFavorites, loading, showSnackbar]);

  return {
    isSignedIn,
    isFavorite: isFavorite(id),
    loading,
    error,
    handleFavoriteChange,
  };
};

export default useFavorite;
