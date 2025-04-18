import type { ReviewServicePort } from '@domain/ports/reviewServicePort';
import { ReviewRepository } from '@infrastructure/repositories/reviewRepository';
import { Review } from '@domain/entities/Review';
import { ForbiddenError, ResourceAlreadyExistsError, ResourceNotFoundError } from '@shared/errors/customErrors';

export class ReviewService implements ReviewServicePort {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async addReview(
    userId: string,
    userName: string,
    recipeId: string,
    rating: number,
    content: string
  ): Promise<Review> {
    const existingReviews = await this.reviewRepository.getReviewsByRecipe(recipeId);
    if (existingReviews.some((review) => review.userId === userId)) {
      throw new ResourceAlreadyExistsError('Review already exists');
    }
    const review = new Review(userId, userName, recipeId, rating, content);
    return this.reviewRepository.addReview(review);
  }

  async editReview(
    userId: string,
    reviewId: string,
    reviewData: { rating?: number; content?: string },
  ): Promise<Review | null> {
    const existingReview = await this.reviewRepository.getReviewById(reviewId);
    if (!existingReview) {
      throw new ResourceNotFoundError('Review does not exist');
    }
    if (existingReview.userId !== userId) {
      throw new ForbiddenError('You are not authorized to edit this review');
    }
    return this.reviewRepository.editReview(reviewId, reviewData);
  }

  async getReviewsByRecipe(recipeId: string): Promise<Review[]> {
    return this.reviewRepository.getReviewsByRecipe(recipeId);
  }
}
