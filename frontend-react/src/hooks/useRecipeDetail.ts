import type { RecipeType } from '../types';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { recipeData } from '../data/recipeData';

const useRecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe] = useState<RecipeType | undefined>(() =>
    recipeData.find((recipe) => recipe.externalId?.toString() === id)
  );
  const [servings, setServings] = useState(recipe?.servings || 1);

  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings || 1);
    }
  }, [recipe]);

  const handleServingsChange = (newServings: number) => {
    setServings(newServings);
  };

  return {
    recipe,
    servings,
    handleServingsChange,
  };
};

export default useRecipeDetail;
