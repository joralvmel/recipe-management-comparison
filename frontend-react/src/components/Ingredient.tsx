import type React from 'react';

export interface Ingredient {
  _id: string;
  amount: number;
  unitShort: string;
  nameClean: string;
  image: string;
}

interface IngredientProps {
  ingredient: Ingredient;
  currentServings: number;
  initialServings: number;
}

const Ingredient: React.FC<IngredientProps> = ({ ingredient, currentServings, initialServings }) => {
  const calculatedAmount = (ingredient.amount * currentServings) / initialServings;

  return (
    <li className="ingredient">
      <div className="ingredient-quantities">
        <span className="ingredient-quantity">{calculatedAmount.toFixed(1)}</span>
        <span className="ingredient-unit">{ingredient.unitShort}</span>
      </div>
      <div className="ingredient-info">
        <span className="ingredient-name">{ingredient.nameClean}</span>
        <img className="ingredient-image" src={ingredient.image} alt={ingredient.nameClean} />
      </div>
    </li>
  );
};

export default Ingredient;
