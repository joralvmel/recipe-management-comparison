import type { Ingredient as IngredientType } from './Ingredient';
import Ingredient from './Ingredient';

interface IngredientsListProps {
  ingredients: IngredientType[];
}

const IngredientsList: React.FC<IngredientsListProps> = ({ ingredients }) => {
  return (
    <div className="ingredients">
      <label htmlFor="ingredients">Ingredients</label>
      <ul className="ingredient-list">
        {ingredients.map((ingredient) => (
          <Ingredient key={ingredient._id} ingredient={ingredient} />
        ))}
      </ul>
    </div>
  );
};

export default IngredientsList;
