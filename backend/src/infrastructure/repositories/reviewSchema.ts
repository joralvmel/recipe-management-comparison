import { Schema, model, Types } from 'mongoose';

const ReviewSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    recipeId: { type: Types.ObjectId, ref: 'Recipe', required: true },
    rating: { type: Number, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

export const ReviewModel = model('Review', ReviewSchema);
