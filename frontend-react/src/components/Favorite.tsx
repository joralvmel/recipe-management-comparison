import type React from 'react';
import { useFavorites } from '../context/FavoriteContext';

interface FavoriteProps {
  id: string;
}

const Favorite: React.FC<FavoriteProps> = ({ id }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleFavoriteChange = () => {
    toggleFavorite(id);
    console.log(`Favorite ${id} toggled`);
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
