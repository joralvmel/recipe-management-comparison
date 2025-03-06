import type { ReviewServicePort } from '@domain/ports/reviewServicePort';
import type { Review } from '@domain/entities/Review';

export class editReview {
  constructor(private reviewService: ReviewServicePort) {}

  async execute(
    userId: string,
    reviewId: string,
    reviewData: { rating?: number; content?: string },
  ): Promise<Review | null> {
    return this.reviewService.editReview(userId, reviewId, reviewData);
  }
}
