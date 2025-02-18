import { SearchOptions, RecipeSearchResponse } from '@application/interfaces/recipeInterfaces';
import { IRecipe } from '@infrastructure/repositories/recipeSchema';

export interface RecipeServicePort {
  searchRecipes(options: SearchOptions): Promise<RecipeSearchResponse>;
  getRecipeDetail(recipeId: string): Promise<IRecipe | null>;
}
