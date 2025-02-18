import { RecipeService } from '@application/services/recipeService';
import { SearchOptions } from '@application/interfaces/recipeInterfaces';

const recipeService = new RecipeService();

export const searchRecipes = async (options: SearchOptions) => {
  return await recipeService.searchRecipes(options);
};
