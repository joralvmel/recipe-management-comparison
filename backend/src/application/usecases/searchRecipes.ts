import { RecipeService } from '@application/services/recipeService';
import { SearchOptions } from '@application/interfaces/recipeInterfaces';
import { RecipeServicePort } from '@domain/ports/recipeServicePort';

const recipeService: RecipeServicePort = new RecipeService();

export const searchRecipes = async (options: SearchOptions) => {
  return await recipeService.searchRecipes(options);
};
