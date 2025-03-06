import type { ReviewRepositoryPort } from '@domain/ports/reviewRepositoryPort';
import { ReviewModel } from './reviewSchema';
import type { Review } from '@domain/entities/Review';

export class ReviewRepository implements ReviewRepositoryPort {
  async addReview(review: Review): Promise<Review> {
    const newReview = new ReviewModel(review);
    await newReview.save();
    return newReview.toObject();
  }

  async editReview(reviewId: string, reviewData: Partial<Review>): Promise<Review | null> {
    return ReviewModel.findByIdAndUpdate(reviewId, reviewData, { new: true }).lean().exec();
  }

  async getReviewsByRecipe(recipeId: string): Promise<Review[]> {
    return ReviewModel.find({ recipeId }).lean().exec();
  }

  async getReviewById(reviewId: string): Promise<Review | null> {
    return ReviewModel.findById(reviewId).lean().exec();
  }
}
