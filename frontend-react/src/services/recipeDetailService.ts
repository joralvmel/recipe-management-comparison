import axios, { AxiosError } from 'axios';
import type { RecipeType } from '../types';

const API_URL = 'http://localhost:3000/recipes';
const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';

export const fetchRecipeDetail = async (id: string): Promise<RecipeType | null> => {
  if (!useBackend) {
    const { recipeData } = await import('../data/recipeData');
    const recipe = recipeData.find((recipe) => recipe.externalId?.toString() === id);
    return recipe || null;
  }

  try {
    const { data } = await axios.get<RecipeType>(`${API_URL}/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error('Error fetching recipe detail:', error.response.data?.message);
      return null;
    }
    console.error('An unexpected error occurred:', error);
    return null;
  }
};
