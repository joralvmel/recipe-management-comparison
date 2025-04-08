import type React from 'react';

interface RecipeInfoProps {
  readyInMinutes: number;
  healthScore: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
}

const RecipeInfo: React.FC<RecipeInfoProps> = ({
                                                 readyInMinutes,
                                                 healthScore,
                                                 cuisines,
                                                 dishTypes,
                                                 diets,
                                               }) => {
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