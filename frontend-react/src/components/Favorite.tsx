import type React from 'react';
import Input from './Input';

interface FavoriteProps {
  id: string;
  isFavorite: boolean;
  onFavoriteChange: () => void;
}

const Favorite: React.FC<FavoriteProps> = ({ id, isFavorite, onFavoriteChange }) => {
  const handleFavoriteClick = () => {
    const checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      onFavoriteChange();
    }
  };

  return (
    <div className="input-favorite">
      <Input inputType="checkbox" id={id} className="favorite-checkbox" required={false} defaultChecked={isFavorite} />
      <span
        className="favorite-label"
        onClick={handleFavoriteClick}
        onKeyUp={(e) => e.key === 'Enter' && handleFavoriteClick()}
      />
    </div>
  );
};

export default Favorite;
