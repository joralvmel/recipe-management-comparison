import type React from 'react';
import useRecipeDetail from '../hooks/useRecipeDetail';
import RecipeMain from '../components/RecipeMain';
import RecipeSection from '../components/RecipeSection';
import ReviewSection from '../components/ReviewSection';
import '@styles/pages/_recipe-detail.scss';

const RecipeDetail: React.FC = () => {
  const { recipe, servings, handleServingsChange, transformedIngredients } = useRecipeDetail();

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="recipe-container">
      <div className="recipe-detail">
        <RecipeMain
          id={recipe.externalId.toString()}
          title={recipe.title}
          image={recipe.image}
        />
        <RecipeSection
          servings={servings}
          initialServings={recipe.servings}
          ingredients={transformedIngredients}
          readyInMinutes={recipe.readyInMinutes}
          healthScore={recipe.healthScore}
          cuisines={recipe.cuisines}
          dishTypes={recipe.dishTypes}
          diets={recipe.diets}
          instructions={recipe.analyzedInstructions}
          onServingsChange={handleServingsChange}
        />
        <ReviewSection recipeId={recipe.externalId.toString()} />
      </div>
    </div>
  );
};

export default RecipeDetail;
