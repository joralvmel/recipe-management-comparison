import type React from 'react';
import type { RecipeType } from '@src/types';
import ServingsFilter from '@components/ServingsFilter';
import IngredientsList from '@components/IngredientsList';
import RecipeInfo from '@components/RecipeInfo';
import RecipeInstructions from '@components/RecipeInstructions';

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
