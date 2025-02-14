import { Schema, model, Document } from 'mongoose';
import { IngredientSchema } from './ingredientSchema';

interface IRecipe extends Document {
  externalId: number;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  servings: number;
  instructions: string[];
  ingredients: {
    externalId: number;
    name: string;
    amount: number;
    unit: string;
    image: string;
  }[];
}

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
    ingredients: [IngredientSchema],
    instructions: [{ type: String }],
  },
  {
    versionKey: false,
  },
);

const RecipeModel = model<IRecipe>('Recipe', RecipeSchema);

export { RecipeModel, IRecipe };
