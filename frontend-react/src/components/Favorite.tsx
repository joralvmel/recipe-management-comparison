import type React from 'react';
import useFavorite from '../hooks/useFavorite';

interface FavoriteProps {
  id: string;
}

const Favorite: React.FC<FavoriteProps> = ({ id }) => {
  const { isSignedIn, isFavorite, loading, error, handleFavoriteChange } = useFavorite(id);

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="input-favorite">
      <input
        type="checkbox"
        id={id}
        className="favorite-checkbox"
        checked={isFavorite}
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
