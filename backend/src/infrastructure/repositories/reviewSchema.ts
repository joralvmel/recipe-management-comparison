import { Schema, model } from 'mongoose';

const ReviewSchema = new Schema(
  {
    userId: { type: String, required: true },
    recipeId: { type: String, required: true },
    rating: { type: Number, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

export const ReviewModel = model('Review', ReviewSchema);
