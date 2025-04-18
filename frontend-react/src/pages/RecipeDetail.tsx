import type React from 'react';
import useRecipeDetail from '../hooks/useRecipeDetail';
import RecipeMain from '../components/RecipeMain';
import RecipeSection from '../components/RecipeSection';
import ReviewSection from '../components/ReviewSection';
import Loader from '../components/Loader';
import '@styles/pages/_recipe-detail.scss';

const RecipeDetail: React.FC = () => {
  const { recipe, servings, handleServingsChange, loading } = useRecipeDetail();

  if (loading) {
    return <Loader message="Loading recipe details..." size="large" />;
  }

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="recipe-container">
      <div className="recipe-detail">
        <RecipeMain recipe={recipe} />
        <RecipeSection
          recipe={recipe}
          initialServings={servings}
          onServingsChange={handleServingsChange}
        />
        <ReviewSection recipeId={recipe.externalId?.toString() || ''} />
      </div>
    </div>
  );
};

export default RecipeDetail;
