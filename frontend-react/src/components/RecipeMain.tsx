import type React from 'react';
import Favorite from './Favorite';

interface RecipeMainProps {
  image: string;
  title: string;
  isFavorite: boolean;
  onFavoriteChange: () => void;
}

const RecipeMain: React.FC<RecipeMainProps> = ({ image, title, isFavorite, onFavoriteChange }) => {
  return (
    <>
      <div className="recipe-header">
        <h1>{title}</h1>
        <div className="recipe-actions">
          <Favorite id="favorite" isFavorite={isFavorite} onFavoriteChange={onFavoriteChange} />
        </div>
      </div>
      <div className="recipe-main">
        <div className="recipe-image">
          <img src={image} alt={title} />
        </div>
      </div>
    </>
  );
};

export default RecipeMain;
