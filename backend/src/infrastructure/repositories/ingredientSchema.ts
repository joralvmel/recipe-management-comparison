// infrastructure/repositories/ingredientSchema.ts
import { Schema } from 'mongoose';

export const IngredientSchema = new Schema(
  {
    externalId: { type: Number },
    nameClean: { type: String, required: true },
    amount: { type: Number },
    unit: { type: String },
    image: { type: String },
  },
  {
    versionKey: false,
  },
);
