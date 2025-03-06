import { Schema, model } from 'mongoose';
import { IRecipeSearch } from '@application/interfaces/recipeInterfaces';

const RecipeSearchSchema = new Schema<IRecipeSearch>(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    image: { type: String, required: false },
  },
  {
    versionKey: false,
  },
);

const RecipeSearchModel = model<IRecipeSearch>('RecipeSearch', RecipeSearchSchema);

export { RecipeSearchModel, IRecipeSearch };
