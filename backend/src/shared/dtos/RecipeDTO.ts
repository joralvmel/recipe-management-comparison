export interface RecipeSearchDTO {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  mealType?: string;
  offset?: number;
  number?: number;
}

export interface RecipeDetailDTO {
  externalId: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  healthScore?: number;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  servings?: number;
  analyzedInstructions?: string[];
  extendedIngredients?: {
    externalId: number;
    nameClean: string;
    amount: number;
    unitShort: string;
    image: string;
  }[];
}
