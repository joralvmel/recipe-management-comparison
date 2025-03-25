import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { recipeData } from '../data/recipeData';
import RecipeHeader from '../components/RecipeHeader';
import RecipeMain from '../components/RecipeMain';
import RecipeSection from '../components/RecipeSection';
import ReviewSection from '../components/ReviewSection';
import '@styles/pages/_recipe-detail.scss';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const recipe = recipeData.find((recipe) => recipe.externalId.toString() === id);
  const [isFavorite, setIsFavorite] = useState(true);
  const [servings, setServings] = useState(recipe ? recipe.servings : 1);

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  const handleFavoriteChange = () => {
    setIsFavorite(!isFavorite);
  };

  const handleServingsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServings(Number(event.target.value));
  };

  return (
   <div className="recipe-container">
    <div className="recipe-detail">
      <RecipeHeader title={recipe.title} isFavorite={isFavorite} onFavoriteChange={handleFavoriteChange} />
      <RecipeMain image={recipe.image} title={recipe.title} />
      <RecipeSection
        servings={servings}
        onServingsChange={handleServingsChange}
        ingredients={recipe.extendedIngredients}
        readyInMinutes={recipe.readyInMinutes}
        healthScore={recipe.healthScore}
        cuisines={recipe.cuisines}
        dishTypes={recipe.dishTypes}
        diets={recipe.diets}
        instructions={recipe.analyzedInstructions}
      />
      <ReviewSection />
    </div>
   </div>
  );
};

export default RecipeDetail;