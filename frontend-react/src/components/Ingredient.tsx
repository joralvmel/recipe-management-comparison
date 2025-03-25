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
}

const Ingredient: React.FC<IngredientProps> = ({ ingredient }) => {
  return (
    <li className="ingredient">
      <div className="ingredient-quantities">
        <span className="ingredient-quantity">{ingredient.amount}</span>
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
