import type { SearchOptions, RecipeSearchResponse } from '@application/interfaces/recipeInterfaces';
import type { RecipeDetailDTO } from '@shared/dtos/RecipeDTO';

export interface RecipeServicePort {
  searchRecipes(options: SearchOptions): Promise<RecipeSearchResponse>;
  getRecipeDetail(recipeId: string): Promise<RecipeDetailDTO | null>;
}
