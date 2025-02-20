import { RecipeService } from '@application/services/recipeService';
import { RecipeServicePort } from '@domain/ports/recipeServicePort';
import { BadRequestError } from '@shared/errors/customErrors';

const recipeService: RecipeServicePort = new RecipeService();

export const getRecipeDetail = async (recipeId: string) => {
  if (!recipeId) {
    throw new BadRequestError('Recipe ID is missing');
  }
  return await recipeService.getRecipeDetail(recipeId);
};
