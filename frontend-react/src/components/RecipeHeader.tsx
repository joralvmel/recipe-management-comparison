import type React from 'react';

interface RecipeHeaderProps {
  title: string;
  isFavorite: boolean;
  onFavoriteChange: () => void;
}

const RecipeHeader: React.FC<RecipeHeaderProps> = ({ title, isFavorite, onFavoriteChange }) => {
  return (
    <div className="recipe-header">
      <h1>{title}</h1>
      <div className="recipe-actions">
        <div className="input-favorite">
          <input
            type="checkbox"
            id="favorite"
            className="favorite-checkbox"
            checked={isFavorite}
            onChange={onFavoriteChange}
          />
          <label htmlFor="favorite" className="favorite-label" />
        </div>
      </div>
    </div>
  );
};

export default RecipeHeader;
