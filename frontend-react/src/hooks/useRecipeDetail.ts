import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { recipeData } from '../data/recipeData';

const useRecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe] = useState(() => recipeData.find(
    (recipe) => recipe.externalId.toString() === id
  ));
  const [servings, setServings] = useState(recipe ? recipe.servings : 1);

  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings);
    }
  }, [recipe]);

  const handleServingsChange = (newServings: number) => {
    setServings(newServings);
  };

  const transformedIngredients = recipe?.extendedIngredients.map(ingredient => ({
    ...ingredient,
    _id: ingredient._id.$oid,
  })) || [];

  return {
    recipe,
    servings,
    handleServingsChange,
    transformedIngredients,
  };
};

export default useRecipeDetail;
