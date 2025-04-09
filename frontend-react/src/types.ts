export interface UserType {
  id?: string;
  email: string;
  name: string;
  password: string;
  createdAt?: number;
  [key: string]: unknown;
}

export interface FavoriteType {
  id: string;
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
  id?: string;
  title?: string;
  image?: string;
  readyInMinutes?: number;
  healthScore?: number;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  servings?: number;
  instructions?: string[];
  ingredients?: IngredientType[];
}

export interface IngredientType {
  _id: string;
  amount: number;
  unitShort: string;
  nameClean: string;
  image: string;
}

export interface CardDataType {
  _id: { $oid: string };
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
}