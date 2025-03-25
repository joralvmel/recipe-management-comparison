import type React from 'react';
import type { Ingredient } from './Ingredient';
import IngredientComponent from './Ingredient';

interface IngredientsListProps {
  ingredients: Ingredient[];
}

const IngredientsList: React.FC<IngredientsListProps> = ({ ingredients }) => {
  return (
    <div className="ingredients">
      <label htmlFor="ingredients">Ingredients</label>
      <ul className="ingredient-list">
        {ingredients.map((ingredient) => (
          <IngredientComponent key={ingredient._id} ingredient={ingredient} />
        ))}
      </ul>
    </div>
  );
};

export default IngredientsList;
