import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { recipeData } from '../data/recipeData';
import RecipeMain from '../components/RecipeMain';
import RecipeSection from '../components/RecipeSection';
import ReviewSection from '../components/ReviewSection';
import '@styles/pages/_recipe-detail.scss';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const recipe = recipeData.find(
    (recipe) => recipe.externalId.toString() === id
  );
  const [servings, setServings] = useState(recipe ? recipe.servings : 1);

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  const handleServingsChange = (newServings: number) => {
    setServings(newServings);
  };

  const transformedIngredients = recipe.extendedIngredients.map(ingredient => ({
    ...ingredient,
    _id: ingredient._id.$oid,
  }));

  return (
    <div className="recipe-container">
      <div className="recipe-detail">
        {id && (
          <RecipeMain
            id={id}
            title={recipe.title}
            image={recipe.image}
          />
        )}
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
        <ReviewSection recipeId={id ?? ''} />
      </div>
    </div>
  );
};

export default RecipeDetail;
