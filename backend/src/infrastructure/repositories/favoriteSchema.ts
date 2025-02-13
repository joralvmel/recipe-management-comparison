import { Schema, model, Types } from 'mongoose';

const FavoriteSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    recipeId: { type: Types.ObjectId, ref: 'Recipe', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

export const FavoriteModel = model('Favorite', FavoriteSchema);
