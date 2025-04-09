import type React from 'react';
import type { IngredientType } from '../types';
import Ingredient from './Ingredient';

interface IngredientsListProps {
  ingredients: IngredientType[];
  currentServings: number;
  initialServings: number;
}

const IngredientsList: React.FC<IngredientsListProps> = ({ ingredients, currentServings, initialServings }) => {
  return (
    <div className="ingredients">
      <label htmlFor="ingredients">Ingredients</label>
      <ul className="ingredient-list">
        {ingredients.map((ingredient) => (
          <Ingredient
            key={ingredient.nameClean}
            ingredient={ingredient}
            currentServings={currentServings}
            initialServings={initialServings}
          />
        ))}
      </ul>
    </div>
  );
};

export default IngredientsList;
