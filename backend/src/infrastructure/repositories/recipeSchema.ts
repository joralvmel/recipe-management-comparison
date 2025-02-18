import { Schema, model } from 'mongoose';
import { IngredientSchema } from './ingredientSchema';
import { IRecipe } from '@application/interfaces/recipeInterfaces';

const RecipeSchema = new Schema<IRecipe>(
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
    extendedIngredients: [IngredientSchema],
    analyzedInstructions: [{ type: String }],
  },
  {
    versionKey: false,
  },
);

const RecipeModel = model<IRecipe>('Recipe', RecipeSchema);

export { RecipeModel, IRecipe };
