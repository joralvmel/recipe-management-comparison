import type { IRecipe } from '@infrastructure/repositories/recipeSchema';
import type { RecipeDetailDTO } from '@shared/dtos/RecipeDTO';

export function toRecipeDetailDTO(recipe: IRecipe): RecipeDetailDTO {
  return {
    externalId: recipe.externalId,
    title: recipe.title,
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes,
    healthScore: recipe.healthScore,
    cuisines: recipe.cuisines,
    dishTypes: recipe.dishTypes,
    diets: recipe.diets,
    servings: recipe.servings,
    analyzedInstructions: recipe.analyzedInstructions,
    extendedIngredients: recipe.extendedIngredients,
  };
}
