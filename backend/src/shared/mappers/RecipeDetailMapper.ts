import type { IRecipe } from '@infrastructure/repositories/recipeSchema';
import type { RecipeDetailDTO } from '@shared/dtos/RecipeDTO';

const capitalize = (str: string) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function toRecipeDetailDTO(recipe: IRecipe): RecipeDetailDTO {
  return {
    externalId: recipe.externalId,
    title: capitalize(recipe.title),
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes,
    healthScore: recipe.healthScore,
    cuisines: recipe.cuisines,
    dishTypes: recipe.dishTypes.map(capitalize),
    diets: recipe.diets.map(capitalize),
    servings: recipe.servings,
    analyzedInstructions: recipe.analyzedInstructions,
    extendedIngredients: recipe.extendedIngredients,
  };
}
