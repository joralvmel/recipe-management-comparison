import type React from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext.tsx';

interface FavoriteProps {
  id: string;
}

const Favorite: React.FC<FavoriteProps> = ({ id }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isSignedIn } = useAuth();

  const handleFavoriteChange = () => {
    const wasFavorite = isFavorite(id);
    toggleFavorite(id);
    if (wasFavorite) {
      console.log(`Favorite ${id} removed`);
    } else {
      console.log(`Favorite ${id} added`);
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
        tabIndex={0}
      />
    </div>
  );
};

export default Favorite;
