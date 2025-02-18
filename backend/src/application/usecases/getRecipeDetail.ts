import { RecipeService } from '@application/services/recipeService';

const recipeService = new RecipeService();

export const getRecipeDetail = async (recipeId: string) => {
  if (!recipeId) {
    throw new Error('Recipe ID is missing');
  }
  return await recipeService.getRecipeDetail(recipeId);
};
