import type React from 'react';
import Favorite from './Favorite';

interface RecipeMainProps {
  id: string;
  image: string;
  title: string;
}

const RecipeMain: React.FC<RecipeMainProps> = ({ id, image, title }) => {
  return (
    <>
      <div className="recipe-header">
        <h1>{title}</h1>
        <div className="recipe-actions">
          <Favorite id={id} />
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
