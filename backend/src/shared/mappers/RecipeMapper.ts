import type { Recipe } from '@application/interfaces/recipeInterfaces';

const capitalize = (str: string) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function toRecipeDTO(recipe: {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
}): Recipe {
  return {
    id: recipe.id,
    title: capitalize(recipe.title),
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes,
    healthScore: recipe.healthScore,
    cuisines: recipe.cuisines.map(capitalize),
    dishTypes: recipe.dishTypes.map(capitalize),
    diets: recipe.diets.map(capitalize),
  };
}
