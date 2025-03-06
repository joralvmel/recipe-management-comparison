import type { Recipe } from '@application/interfaces/recipeInterfaces';

export function toRecipeDTO(recipe: { id: number; title: string; image: string }): Recipe {
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
  };
}
