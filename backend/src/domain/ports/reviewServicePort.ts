import { Review } from '@domain/entities/Review';

export interface ReviewServicePort {
  addReview(userId: string, recipeId: string, rating: number, content: string): Promise<Review>;
  editReview(reviewId: string, reviewData: { rating?: number; content?: string }): Promise<Review | null>;
  getReviewsByRecipe(recipeId: string): Promise<Review[]>;
}
