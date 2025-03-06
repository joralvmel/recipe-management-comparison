import type { Review } from '@domain/entities/Review';

export interface ReviewRepositoryPort {
  addReview(review: Review): Promise<Review>;
  editReview(reviewId: string, reviewData: Partial<Review>): Promise<Review | null>;
  getReviewsByRecipe(recipeId: string): Promise<Review[]>;
}
