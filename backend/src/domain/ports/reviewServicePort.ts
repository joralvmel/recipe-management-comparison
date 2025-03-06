import type { Review } from '@domain/entities/Review';

export interface ReviewServicePort {
  addReview(userId: string, recipeId: string, rating: number, content: string): Promise<Review>;
  editReview(
    userId: string,
    reviewId: string,
    reviewData: { rating?: number; content?: string },
  ): Promise<Review | null>;
  getReviewsByRecipe(recipeId: string): Promise<Review[]>;
}
