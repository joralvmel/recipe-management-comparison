import type React from 'react';
import { useState } from 'react';
import { useFavoriteContext } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';

interface FavoriteProps {
  id: string;
}

const Favorite: React.FC<FavoriteProps> = ({ id }) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoriteContext();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFavoriteChange = async () => {
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
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="input-favorite">
      <input
        type="checkbox"
        id={id}
        className="favorite-checkbox"
        checked={isFavorite(id)}
        onChange={handleFavoriteChange}
        disabled={loading}
        tabIndex={0}
      />
      {loading && <span className="loading-indicator">Loading...</span>}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Favorite;
