import type React from 'react';
import { useFavorites } from '../context/FavoriteContext';

interface FavoriteProps {
  id: string;
}

const Favorite: React.FC<FavoriteProps> = ({ id }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleFavoriteChange = () => {
    const wasFavorite = isFavorite(id);
    toggleFavorite(id);
    if (wasFavorite) {
      console.log(`Favorite ${id} removed`);
    } else {
      console.log(`Favorite ${id} added`);
    }
  };

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
