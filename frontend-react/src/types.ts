export interface UserType {
  id?: string;
  email: string;
  name: string;
  password: string;
  createdAt?: number;
  [key: string]: unknown;
}

export interface FavoriteType {
  _id: string;
  userId: string;
  recipeId: string;
  createdAt: string;
}

export interface ReviewType {
  _id: string;
  userId: string;
  recipeId: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface RecipeType {
  _id?: ObjectIdType;
  id?: number;
  externalId?: number;
  title?: string;
  image?: string;
  readyInMinutes?: number;
  healthScore?: number;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  servings?: number;
  analyzedInstructions?: string[];
  extendedIngredients?: IngredientType[];
}

export interface IngredientType {
  _id?: ObjectIdType;
  externalId: number;
  amount: number;
  unitShort: string;
  nameClean: string;
  image: string;
}

export interface ObjectIdType {
  $oid: string;
}

export interface FetchRecipesResponse {
  results: RecipeType[];
  totalResults: number;
}