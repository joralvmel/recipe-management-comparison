import type React from 'react';
import type { RecipeType } from '../types';
import Favorite from './Favorite';

interface RecipeMainProps {
  recipe: RecipeType;
}

const RecipeMain: React.FC<RecipeMainProps> = ({ recipe }) => {
  const { externalId, image, title } = recipe;

  return (
    <>
      <div className="recipe-header">
        <h1>{title || 'Untitled Recipe'}</h1>
        <div className="recipe-actions">
          {externalId && <Favorite id={externalId.toString()} />}
        </div>
      </div>
      <div className="recipe-main">
        <div className="recipe-image">
          <img src={image || ''} alt={title || 'Recipe Image'} />
        </div>
      </div>
    </>
  );
};

export default RecipeMain;
