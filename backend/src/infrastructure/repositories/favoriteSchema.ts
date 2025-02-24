import { Schema, model } from 'mongoose';

const FavoriteSchema = new Schema(
  {
    userId: { type: String, required: true },
    recipeId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

export const FavoriteModel = model('Favorite', FavoriteSchema);
