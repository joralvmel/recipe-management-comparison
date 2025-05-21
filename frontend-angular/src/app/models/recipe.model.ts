export interface IngredientType {
  externalId: number;
  nameClean: string;
  amount: number;
  unitShort: string;
  image: string;
  _id?: {
    $oid: string;
  };
}

export interface RecipeType {
  _id: {
    $oid: string;
  };
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
}

export interface RecipeDetailType extends Omit<RecipeType, 'id'> {
  externalId: number;
  servings: number;
  extendedIngredients: IngredientType[];
  analyzedInstructions: string[];
}
