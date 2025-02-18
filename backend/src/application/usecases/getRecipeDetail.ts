import { RecipeService } from '@application/services/recipeService';
import { RecipeServicePort } from '@domain/ports/recipeServicePort';

const recipeService: RecipeServicePort = new RecipeService();

export const getRecipeDetail = async (recipeId: string) => {
  if (!recipeId) {
    throw new Error('Recipe ID is missing');
  }
  return await recipeService.getRecipeDetail(recipeId);
};
