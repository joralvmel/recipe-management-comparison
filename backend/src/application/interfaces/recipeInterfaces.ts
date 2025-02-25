import { Document } from 'mongoose';

export interface SearchOptions {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  mealType?: string;
  offset?: number;
  number?: number;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
}

export interface RecipeSearchResponse {
  results: Recipe[];
  offset: number;
  number: number;
  totalResults: number;
}

export interface Ingredient {
  id: number;
  nameClean: string;
  image: string;
  measures: {
    metric: {
      amount: number;
      unitShort: string;
    };
  };
}

export interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  servings: number;
  analyzedInstructions: { steps: { step: string }[] }[];
  extendedIngredients: Ingredient[];
}

export interface IRecipe extends Document {
  externalId: number;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  servings: number;
  analyzedInstructions: string[];
  extendedIngredients: {
    externalId: number;
    nameClean: string;
    amount: number;
    unitShort: string;
    image: string;
  }[];
}

export interface IRecipeSearch extends Document {
  id: number;
  title: string;
  image: string;
}
