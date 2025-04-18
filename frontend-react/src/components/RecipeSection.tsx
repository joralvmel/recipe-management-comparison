import type React from 'react';
import type { RecipeType } from '../types';
import ServingsFilter from './ServingsFilter';
import IngredientsList from './IngredientsList';
import RecipeInfo from './RecipeInfo';
import RecipeInstructions from './RecipeInstructions';

interface RecipeSectionProps {
  recipe: RecipeType;
  initialServings: number;
  onServingsChange: (newServings: number) => void;
}

const RecipeSection: React.FC<RecipeSectionProps> = ({
                                                       recipe,
                                                       initialServings,
                                                       onServingsChange,
                                                     }) => {
  const {
    extendedIngredients = [],
    analyzedInstructions = [],
  } = recipe;

  return (
    <div className="recipe-section">
      <div className="ingredients-container">
        <ServingsFilter servings={initialServings} onServingsChange={onServingsChange} />
        <IngredientsList
          ingredients={extendedIngredients}
          currentServings={initialServings}
          initialServings={recipe.servings || 1}
        />
      </div>
      <div className="recipe-wrapper">
        <RecipeInfo recipe={recipe} />
        <RecipeInstructions instructions={analyzedInstructions} />
      </div>
    </div>
  );
};

export default RecipeSection;
