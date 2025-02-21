import { SearchOptions, RecipeSearchResponse } from '@application/interfaces/recipeInterfaces';
import { RecipeDetailDTO } from '@shared/dtos/RecipeDTO';

export interface RecipeServicePort {
  searchRecipes(options: SearchOptions): Promise<RecipeSearchResponse>;
  getRecipeDetail(recipeId: string): Promise<RecipeDetailDTO | null>;
}
