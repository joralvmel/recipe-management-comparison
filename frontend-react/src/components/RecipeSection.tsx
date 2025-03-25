import type React from 'react';
import type { Ingredient } from './Ingredient';
import ServingsFilter from './ServingsFilter';
import IngredientsList from './IngredientsList';
import RecipeInfo from './RecipeInfo';
import RecipeInstructions from './RecipeInstructions';

interface RecipeSectionProps {
  servings: number;
  onServingsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ingredients: Ingredient[];
  readyInMinutes: number;
  healthScore: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  instructions: string[];
}

const RecipeSection: React.FC<RecipeSectionProps> = ({
                                                       servings,
                                                       onServingsChange,
                                                       ingredients,
                                                       readyInMinutes,
                                                       healthScore,
                                                       cuisines,
                                                       dishTypes,
                                                       diets,
                                                       instructions,
                                                     }) => {
  return (
    <div className="recipe-section">
      <div className="ingredients-container">
        <ServingsFilter servings={servings} onServingsChange={onServingsChange} />
        <IngredientsList ingredients={ingredients} />
      </div>
      <div className="recipe-wrapper">
        <RecipeInfo
          readyInMinutes={readyInMinutes}
          healthScore={healthScore}
          cuisines={cuisines}
          dishTypes={dishTypes}
          diets={diets}
        />
        <RecipeInstructions instructions={instructions} />
      </div>
    </div>
  );
};

export default RecipeSection;