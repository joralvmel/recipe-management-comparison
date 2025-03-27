import type React from 'react';
import Favorite from './Favorite';

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
        <Favorite id="favorite" isFavorite={isFavorite} onFavoriteChange={onFavoriteChange} />
      </div>
    </div>
  );
};

export default RecipeHeader;