import axios, { AxiosError } from 'axios';
import type { RecipeType } from '@src/types';

const API_URL = `${import.meta.env.VITE_API_URL}/recipes`;
const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';

export const fetchRecipeDetail = async (id: string): Promise<RecipeType | null> => {
  if (!useBackend) {
    const { recipeData } = await import('@data/recipeData');
    const recipe = recipeData.find((recipe) => recipe.externalId?.toString() === id);
    return recipe || null;
  }

  try {
    const { data } = await axios.get<RecipeType>(`${API_URL}/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data?.message || 'Error fetching recipe detail from backend');
    }
    throw new Error('An unexpected error occurred');
  }
};
