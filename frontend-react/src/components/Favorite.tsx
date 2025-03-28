import type React from 'react';

interface FavoriteProps {
  id: string;
  isFavorite: boolean;
  onFavoriteChange: () => void;
}

const Favorite: React.FC<FavoriteProps> = ({ id, isFavorite, onFavoriteChange }) => {
  const handleFavoriteChange = () => {
    onFavoriteChange();
  };

  return (
    <div className="input-favorite">
      <input
        type="checkbox"
        id={id}
        className="favorite-checkbox"
        defaultChecked={isFavorite}
        onChange={handleFavoriteChange}
        tabIndex={0}
      />
    </div>
  );
};

export default Favorite;
