// infrastructure/repositories/recipeSchema.ts
import { Schema, model } from 'mongoose';
import { IngredientSchema } from './ingredientSchema';

const RecipeSchema = new Schema(
  {
    externalId: { type: Number, required: true },
    title: { type: String, required: true },
    image: { type: String },
    readyInMinutes: { type: Number },
    healthScore: { type: Number },
    cuisines: [{ type: String }],
    dishTypes: [{ type: String }],
    diets: [{ type: String }],
    servings: { type: Number, required: true },
    ingredients: [IngredientSchema],
    instructions: [{ type: String }],
  },
  {
    versionKey: false,
  },
);

export const RecipeModel = model('Recipe', RecipeSchema);
