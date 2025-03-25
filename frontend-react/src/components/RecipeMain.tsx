import type React from 'react';

interface RecipeMainProps {
  image: string;
  title: string;
}

const RecipeMain: React.FC<RecipeMainProps> = ({ image, title }) => {
  return (
    <div className="recipe-main">
      <div className="recipe-image">
        <img src={image} alt={title} />
      </div>
    </div>
  );
};

export default RecipeMain;