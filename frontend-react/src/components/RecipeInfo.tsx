import type React from 'react';
import type { RecipeType } from '@src//types';

interface RecipeInfoProps {
  recipe: RecipeType;
}

const RecipeInfo: React.FC<RecipeInfoProps> = ({ recipe }) => {
  const {
    readyInMinutes = 0,
    healthScore = 0,
    cuisines = [],
    dishTypes = [],
    diets = [],
  } = recipe;

  return (
    <div className="recipe-info">
      <div className="stats">
        <div className="stat">
          <label htmlFor="preparation-time">Preparation Time</label>
          <span>{readyInMinutes} minutes</span>
        </div>
        <div className="stat">
          <label htmlFor="health-score">Health Score</label>
          <span>{healthScore}</span>
        </div>
      </div>
      <div className="info">
        <div className="info-item">
          <label htmlFor="cuisines">Cuisines:</label>
          <span>{cuisines.join(', ')}</span>
        </div>
        <div className="info-item">
          <label htmlFor="dish-types">Dish Types:</label>
          <span>{dishTypes.join(', ')}</span>
        </div>
        <div className="info-item">
          <label htmlFor="diets">Diets:</label>
          <span>{diets.join(', ')}</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeInfo;
