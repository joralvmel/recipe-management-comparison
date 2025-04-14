import { useState, useCallback } from 'react';
import { useFavoriteContext } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';

const useFavorite = (id: string) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoriteContext();
  const { isSignedIn } = useAuth();

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
        console.log(`Favorite ${id} removed`);
      } else {
        await addToFavorites(id);
        console.log(`Favorite ${id} added`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id, isFavorite, addToFavorites, removeFromFavorites, loading]);

  return {
    isSignedIn,
    isFavorite: isFavorite(id),
    loading,
    error,
    handleFavoriteChange,
  };
};

export default useFavorite;