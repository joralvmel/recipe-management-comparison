import type { RecipeType } from '../types';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchRecipeDetail } from '../services/recipeDetailService';
import { useSnackbar } from '../context/SnackbarContext';

const useRecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [servings, setServings] = useState(1);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const getRecipeDetail = async () => {
      if (id) {
        setLoading(true);
        try {
          const fetchedRecipe = await fetchRecipeDetail(id);
          setRecipe(fetchedRecipe);
          setServings(fetchedRecipe?.servings || 1);
        } catch (error) {
          if (error instanceof Error) {
            showSnackbar(error.message, 'error');
          } else {
            showSnackbar('An unexpected error occurred', 'error');
          }
          setRecipe(null);
        } finally {
          setLoading(false);
        }
      }
    };

    getRecipeDetail();
  }, [id, showSnackbar]);

  const handleServingsChange = (newServings: number) => {
    setServings(newServings);
  };

  return {
    recipe,
    servings,
    handleServingsChange,
    loading,
  };
};

export default useRecipeDetail;
